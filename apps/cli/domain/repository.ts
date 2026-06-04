import { type Linters, type Formatters } from '@/configs/types'

export interface Repository {
  installDependencies({ dependencies }: { dependencies: string[] }): Promise<void>
  getPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'>
  writeBiomeConfig(techs: string[]): Promise<void>
  writePrettierConfig(techs: string[]): Promise<void>
  writeEslintConfig(techs: string[]): Promise<void>
  writeOxLintConfig(techs: string[]): Promise<void>
  writeOxFmtConfig(techs: string[]): Promise<void>
  writePackageJsonScripts(formatter: Formatters, linter: Linters): Promise<void>
}
