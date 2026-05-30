import type { PackageManager } from '@/domain/types'

export interface ConfigRepository {
  writeFile(path: string, content: string): void
  configEslint(plugins: string[], cwd: string): void
  configBiome(cwd: string): void
  configOxlint(plugins: string[], cwd: string): void
  configOxfmt(cwd: string): void
  configPrettier(plugins: string[], cwd: string): void
  configVscodeSettings(formatter: string, cwd: string): void
  configLintStaged(linter: string, formatter: string, extensions: string[], cwd: string): void
  initHusky(pm: PackageManager, cwd: string): void
  install(pm: PackageManager, deps: string[], cwd: string): void
}
