import type { Terminal, ConfigWriter, PackageInstaller } from '@/domain/ports'
import { Resolver } from '@/domain/resolver'
import type { PackageManager } from '@/domain/types'
import technologies, { linterNames, formatterNames } from '@/data/index'

export class ConfigureProject {
  constructor(
    private readonly terminal: Terminal,
    private readonly configWriter: ConfigWriter,
    private readonly installer: PackageInstaller,
    private readonly detectedPm: PackageManager | null,
    private readonly resolver: Resolver = new Resolver(),
  ) {}

  async run(): Promise<void> {
    this.terminal.intro({ title: 'Linter & Formatter Configurator' })

    const pm = await this.resolvePackageManager()
    const techs = await this.selectTechnologies()
    const { selectedLinter, selectedFormatter } = await this.selectTools(techs)
    const plugins = this.resolver.collectPlugins({
      techs,
      linter: selectedLinter,
      formatter: selectedFormatter,
    })
    const deps = this.resolver.getAllDeps({
      linter: selectedLinter,
      formatter: selectedFormatter,
      plugins,
    })

    const shouldInstall = await this.terminal.confirmInstall({ deps })
    if (shouldInstall === null || !shouldInstall) {
      this.terminal.cancel({ message: 'Operation cancelled' })
      process.exit(0)
    }

    const cwd = process.cwd()

    this.terminal.startSpinner({ message: 'Generating configuration...' })
    this.configWriter.writeLinterConfig({
      linter: selectedLinter,
      plugins: plugins.linterPlugins,
      cwd,
    })
    this.configWriter.writeFormatterConfig({
      formatter: selectedFormatter,
      plugins: plugins.formatterPlugins,
      cwd,
    })
    this.terminal.stopSpinner({ message: 'Configuration generated' })

    this.terminal.startSpinner({ message: 'Installing dependencies...' })
    try {
      this.installer.install({ pm, deps, cwd })
      this.terminal.stopSpinner({ message: 'Dependencies installed' })
    } catch {
      this.terminal.stopSpinner({ message: 'Error installing dependencies' })
      const flag =
        pm === 'npm' || pm === 'pnpm' ? 'install -D' : pm === 'yarn' ? 'add -D' : 'add -d'
      this.terminal.logError({ message: `Run manually: ${pm} ${flag} ${deps.join(' ')}` })
    }

    this.terminal.outro({ message: 'Done! Your project is configured.' })
  }

  private async resolvePackageManager(): Promise<PackageManager> {
    if (this.detectedPm) {
      this.terminal.logInfo({ message: `Package manager: ${this.detectedPm} (auto-detected)` })
      return this.detectedPm
    }

    const pmChoice = await this.terminal.selectPackageManager()
    if (pmChoice === null) {
      this.terminal.cancel({ message: 'Operation cancelled' })
      process.exit(0)
    }
    return pmChoice
  }

  private async selectTechnologies(): Promise<string[]> {
    const techOptions = Object.entries(technologies).map(([value, label]) => ({ value, label }))
    const techs = await this.terminal.selectTechnologies({ options: techOptions })
    if (techs === null) {
      this.terminal.cancel({ message: 'Operation cancelled' })
      process.exit(0)
    }
    return techs
  }

  private async selectTools(
    techs: string[],
  ): Promise<{ selectedLinter: string; selectedFormatter: string }> {
    const { linters, formatters } = this.resolver.resolve({ techs })

    if (linters.length === 0 || formatters.length === 0) {
      this.terminal.cancel({
        message: 'No compatible linter/formatter combination for the selected technologies.',
      })
      process.exit(1)
    }

    const selectedLinter = await this.selectLinter(linters)
    const selectedFormatter = await this.selectFormatter(formatters)

    return { selectedLinter, selectedFormatter }
  }

  private async selectLinter(linters: string[]): Promise<string> {
    if (linters.length === 1) {
      this.terminal.logInfo({
        message: `Linter: ${linterNames[linters[0]!]} (only compatible option)`,
      })
      return linters[0]!
    }

    const linterChoice = await this.terminal.selectLinter({
      options: linters.map((l) => ({ value: l, label: linterNames[l] || l })),
    })
    if (linterChoice === null) {
      this.terminal.cancel({ message: 'Operation cancelled' })
      process.exit(0)
    }
    return linterChoice
  }

  private async selectFormatter(formatters: string[]): Promise<string> {
    if (formatters.length === 1) {
      this.terminal.logInfo({
        message: `Formatter: ${formatterNames[formatters[0]!]} (only compatible option)`,
      })
      return formatters[0]!
    }

    const formatterChoice = await this.terminal.selectFormatter({
      options: formatters.map((f) => ({ value: f, label: formatterNames[f] || f })),
    })
    if (formatterChoice === null) {
      this.terminal.cancel({ message: 'Operation cancelled' })
      process.exit(0)
    }
    return formatterChoice
  }
}
