import { type Linters, type Formatters } from '@/configs/types'

export interface Repository {
  installDependencies({ dependencies }: { dependencies: string[] }): Promise<void>

  writeBiomeConfig(techs: string[]): Promise<void>
  writePrettierConfig(techs: string[]): Promise<void>
  writeEslintConfig(techs: string[]): Promise<void>
  writeOxLintConfig(techs: string[]): Promise<void>
  writeOxFmtConfig(techs: string[]): Promise<void>

  writeLintStagedConfig(formatter: Formatters, linter: Linters, techs: string[]): Promise<void>
  writeEditorConfig(formatter: Formatters, linter: Linters): Promise<void>

  writePackageJsonScripts(formatter: Formatters, linter: Linters): Promise<void>
  getEditorExtensions(
    formatter: Formatters,
    linter: Linters,
  ): Promise<{ name: string; vsc: string; vsx: string }[]>

  getAutoApproveFlag(): boolean
  initHusky(): Promise<void>
}
