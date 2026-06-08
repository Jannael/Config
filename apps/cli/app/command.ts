import type { Repository } from '@/domain/repository'
import configs from 'configs'
import { MultiSelect } from '@/utils/multiselect'
import Print from 'print'
import { Confirm } from '@/utils/confirm'
import type { WriteFormatterConfigUseCase } from '@/app/write-formatter-config.use-case'
import type { WriteLinterConfigUseCase } from '@/app/write-linter-config.use-case'
import type { GetDependenciesToInstallUseCase } from './get-dependencies-to-install.use-case'
import type { GetLinterUseCase } from './get-linter.use-case'
import type { GetFormatterUseCase } from './get-formatter.use-case'

export class Command {
  constructor(
    private readonly repository: Repository,
    private readonly writeFormatterConfig: WriteFormatterConfigUseCase,
    private readonly writeLinterConfig: WriteLinterConfigUseCase,
    private readonly getDependenciesToInstall: GetDependenciesToInstallUseCase,
    private readonly getLinter: GetLinterUseCase,
    private readonly getFormatter: GetFormatterUseCase,
  ) {}

  async execute(): Promise<void> {
    const AutoApproveFlag = this.repository.getAutoApproveFlag()
    const selectedConfigs = await MultiSelect({
      message: 'Select your technologies:',
      options: Object.keys(configs.techs).map((key) => ({
        value: key,
        label: configs.techs[key as keyof typeof configs.techs]?.label || key,
      })),
    })

    const formatter = await this.getFormatter.execute(selectedConfigs)
    const linter = await this.getLinter.execute(selectedConfigs)

    Print.trace(`Selected technologies: ${selectedConfigs.join(', ')}`)
    Print.trace(`Selected formatter: ${formatter}`)
    Print.trace(`Selected linter: ${linter}`)

    const dependenciesToInstall = await this.getDependenciesToInstall.execute(
      formatter,
      linter,
      selectedConfigs,
    )
    const installConfirm = AutoApproveFlag
      ? AutoApproveFlag
      : await Confirm({
          message: `The following dependencies will be installed: ${dependenciesToInstall.join(', ')}. Do you want to proceed?`,
        })

    if (installConfirm || AutoApproveFlag) {
      await this.repository.installDependencies({ dependencies: dependenciesToInstall })
      Print.success('Dependencies installed successfully.')
    }

    await this.writeLinterConfig.execute(linter, selectedConfigs)
    Print.success('Linter configuration file created successfully.')

    await this.writeFormatterConfig.execute(formatter, selectedConfigs)
    Print.success('Formatter configuration file created successfully.')

    await this.repository.writePackageJsonScripts(formatter, linter)
    Print.success('package.json scripts updated successfully.')

    const editorConfigConfirm = AutoApproveFlag
      ? AutoApproveFlag
      : await Confirm({
          message: 'You want to configure your editor to use the installed formatter and linter?',
        })

    if (editorConfigConfirm || AutoApproveFlag) {
      this.repository.writeEditorConfig(selectedConfigs)
      Print.success('Editor configuration file created successfully.')
    }

    const HuskyConfigConfirm = AutoApproveFlag
      ? AutoApproveFlag
      : await Confirm({
          message:
            'You want to set up Husky pre-commit hooks to run your formatter and linter before each commit?',
        })

    if (HuskyConfigConfirm || AutoApproveFlag) {
      this.repository.installDependencies({ dependencies: ['husky', 'lint-staged'] })
      Print.success('Husky and lint-staged installed successfully.')
      await this.repository.initHusky()
      Print.success('Husky initialized successfully.')
      await this.repository.writeLintStagedConfig(formatter, linter, selectedConfigs)
      Print.success('lint-staged configuration file created successfully.')
    }

    const extensions = await this.repository.getEditorExtensions(formatter, linter)

    if (extensions.length > 0) {
      for (const extension of extensions) {
        Print.info(`Don't forget to install the recommended editor extension: ${extension.name}\n`)
        Print.info(`VS Code Marketplace: ${extension.vsc}\n`)
        Print.info(`Open VSX Registry: ${extension.vsx}\n`)
      }
    }

    Print.success(
      `All done! Your project is now set up with the selected technologies: ${selectedConfigs.join(', ')}, formatter: ${formatter} and linter: ${linter}.`,
    )
  }
}
