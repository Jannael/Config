import type { Repository } from '@/domain/repository'
import configs from 'configs'
import { MultiSelect } from '@/utils/multiselect'
import { Select } from '@/utils/select'
import Print from 'print'
import { Confirm } from '@/utils/confirm'
import type { WriteFormatterConfigUseCase } from './write-formatter-config.usecase'

type Linters = 'eslint' | 'oxlint' | 'biome'
type Formatters = 'prettier' | 'oxfmt' | 'biome'

export class Command {
  constructor(
    private readonly repository: Repository,
    private readonly writeFormatterConfigUseCase: WriteFormatterConfigUseCase,
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

    const formatter = await this.GetFormatter(selectedConfigs)
    const linter = await this.GetLinter(selectedConfigs)

    Print.trace(`Selected technologies: ${selectedConfigs.join(', ')}`)
    Print.trace(`Selected formatter: ${formatter}`)
    Print.trace(`Selected linter: ${linter}`)

    const dependenciesToInstall = await this.GetDependenciesToInstall(
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

    await this.WriteLinterConfig(linter, selectedConfigs)
    Print.success('Linter configuration file created successfully.')

    await this.writeFormatterConfigUseCase.execute(formatter, selectedConfigs)
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
      Print.success('package.json scripts updated successfully with Husky pre-commit hooks.')
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

  private async GetCommonLinters(selectedConfigs: string[]): Promise<string[]> {
    const allLinterSets = selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      return new Set(Object.keys(config?.linter ?? {}))
    })

    const commonLinters = allLinterSets.reduce((acc, set) => {
      return new Set([...acc].filter((linter) => set.has(linter)))
    }, allLinterSets[0] || new Set<string>())

    return [...commonLinters]
  }

  private async GetCommonFormatters(selectedConfigs: string[]): Promise<string[]> {
    const allFormatterSets = selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      return new Set(Object.keys(config?.formatter ?? {}))
    })
    const commonFormatters = allFormatterSets.reduce((acc, set) => {
      return new Set([...acc].filter((formatter) => set.has(formatter)))
    }, allFormatterSets[0] || new Set<string>())

    return [...commonFormatters]
  }

  private async GetFormatter(selectedConfigs: string[]): Promise<Formatters> {
    const commonFormatters = await this.GetCommonFormatters(selectedConfigs)
    let formatter: string = commonFormatters.length === 1 ? commonFormatters[0]! : ''

    if (commonFormatters.length === 0) {
      Print.error('No common formatters found for the selected technologies.')
      process.exit(1)
    }

    if (commonFormatters.length > 1) {
      formatter = await Select({
        message: 'Select your formatter:',
        options: commonFormatters.map((formatter) => {
          return {
            value: formatter,
            label: formatter,
          }
        }),
      })
    }

    return formatter as Formatters
  }

  private async GetLinter(selectedConfigs: string[]): Promise<Linters> {
    const commonLinters = await this.GetCommonLinters(selectedConfigs)
    let linter: string = commonLinters.length === 1 ? commonLinters[0]! : ''

    if (commonLinters.length === 0) {
      Print.error('No common linters found for the selected technologies.')
      process.exit(1)
    }

    if (commonLinters.length > 1) {
      linter = await Select({
        message: 'Select your linter:',
        options: commonLinters.map((linter) => {
          return {
            value: linter,
            label: linter,
          }
        }),
      })
    }
    return linter as Linters
  }

  private async GetDependenciesToInstall(
    formatter: Formatters,
    linter: Linters,
    selectedConfigs: string[],
  ): Promise<string[]> {
    const dependenciesToInstall: string[] = []

    selectedConfigs.map((tech) => {
      // eslint and prettier are the only that can have plugins that need to be installed
      const config = configs.techs[tech as keyof typeof configs.techs]
      const formatterConfig = config?.formatter[formatter] as { plugins?: string[] }
      const linterConfig = config?.linter[linter] as { plugins?: string[] }

      if (formatter === 'prettier' && formatterConfig?.plugins) {
        dependenciesToInstall.push(...formatterConfig.plugins)
      }

      if (linter === 'eslint' && linterConfig?.plugins) {
        dependenciesToInstall.push(...linterConfig.plugins)
      }
    })

    return dependenciesToInstall
  }

  private async WriteLinterConfig(linter: Linters, techs: string[]): Promise<void> {
    if (linter === 'eslint') {
      await this.repository.writeEslintConfig(techs)
    } else if (linter === 'oxlint') {
      await this.repository.writeOxLintConfig(techs)
    } else if (linter === 'biome') {
      await this.repository.writeBiomeConfig(techs)
    }
  }
}
