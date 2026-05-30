import type { ConfigRepository } from '@/domain/repository'
import type { PackageManager } from '@/domain/types'
import { resolve, collectPlugins, getAllDeps } from '@/domain/resolver'
import { detectPackageManager } from '@/infra/pm-detector'
import { Intro } from '@/utils/intro'
import { Outro } from '@/utils/outro'
import { logInfo, logError } from '@/utils/log'
import { Select } from '@/utils/select'
import { MultiSelect } from '@/utils/multiselect'
import { Confirm } from '@/utils/confirm'
import { startSpinner, stopSpinner } from '@/utils/spinner'
import technologies, { linterNames, formatterNames } from '@/data/index'

export class ConfigureProject {
  constructor(private readonly repo: ConfigRepository) {}

  async execute(): Promise<void> {
    Intro('Linter & Formatter Configurator')

    const pm = await this.resolvePackageManager()
    const techs = await this.selectTechnologies()
    const { linter, formatter } = await this.selectTools(techs)
    const plugins = collectPlugins(techs, linter, formatter)
    const deps = getAllDeps(linter, formatter, plugins)

    const shouldInstall = await Confirm({
      message: `The following dependencies will be installed:\n${deps.join(', ')}\n\nContinue?`,
    })

    if (!shouldInstall) {
      logInfo('Operation cancelled')
      process.exit(0)
    }

    const cwd = process.cwd()

    startSpinner('Generating configuration...')
    this.writeConfigs(linter, formatter, plugins, cwd)
    stopSpinner('Configuration generated')

    startSpinner('Installing dependencies...')
    try {
      this.repo.install(pm, deps, cwd)
      stopSpinner('Dependencies installed')
    } catch {
      stopSpinner('Error installing dependencies')
      const flag =
        pm === 'npm' || pm === 'pnpm' ? 'install -D' : pm === 'yarn' ? 'add -D' : 'add -d'
      logError(`Run manually: ${pm} ${flag} ${deps.join(' ')}`)
    }

    Outro('Done! Your project is configured.')
  }

  private async resolvePackageManager(): Promise<PackageManager> {
    const detected = detectPackageManager()

    if (detected) {
      logInfo(`Package manager: ${detected} (auto-detected)`)
      return detected
    }

    return Select<PackageManager>({
      message: 'Select your package manager',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'bun', label: 'bun' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    })
  }

  private async selectTechnologies(): Promise<string[]> {
    const options = Object.entries(technologies).map(([value, label]) => ({ value, label }))
    return MultiSelect({ message: 'Select your technologies', options })
  }

  private async selectTools(techs: string[]): Promise<{ linter: string; formatter: string }> {
    const { linters, formatters } = resolve(techs)

    if (linters.length === 0 || formatters.length === 0) {
      logError('No compatible linter/formatter combination for the selected technologies.')
      process.exit(1)
    }

    const linter = await this.selectTool('linter', linters, linterNames)
    const formatter = await this.selectTool('formatter', formatters, formatterNames)

    return { linter, formatter }
  }

  private async selectTool(
    type: string,
    items: string[],
    names: Record<string, string>,
  ): Promise<string> {
    if (items.length === 1) {
      logInfo(`${type}: ${names[items[0]!]} (only compatible option)`)
      return items[0]!
    }

    return Select({
      message: `Select your ${type}`,
      options: items.map((item) => ({ value: item, label: names[item] || item })),
    })
  }

  private writeConfigs(
    linter: string,
    formatter: string,
    plugins: { linterPlugins: string[]; formatterPlugins: string[]; oxlintPlugins: string[] },
    cwd: string,
  ): void {
    if (linter === 'biome' && formatter === 'biome') {
      this.repo.configBiome(cwd)
    } else {
      this.writeLinterConfig(linter, plugins.linterPlugins, plugins.oxlintPlugins, cwd)
      this.writeFormatterConfig(formatter, plugins.formatterPlugins, cwd)
    }
  }

  private writeLinterConfig(
    linter: string,
    linterPlugins: string[],
    oxlintPlugins: string[],
    cwd: string,
  ): void {
    if (linter === 'eslint') {
      this.repo.configEslint(linterPlugins, cwd)
    } else if (linter === 'oxlint') {
      this.repo.configOxlint(oxlintPlugins, cwd)
    } else if (linter === 'biome') {
      this.repo.configBiome(cwd)
    }
  }

  private writeFormatterConfig(formatter: string, formatterPlugins: string[], cwd: string): void {
    if (formatter === 'prettier') {
      this.repo.configPrettier(formatterPlugins, cwd)
    } else if (formatter === 'oxfmt') {
      this.repo.configOxfmt(cwd)
    } else if (formatter === 'biome') {
      this.repo.configBiome(cwd)
    }
  }
}
