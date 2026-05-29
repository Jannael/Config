import type { PackageManager } from '@/domain/types'

export interface Terminal {
  intro(title: string): void
  outro(message: string): void
  logInfo(message: string): void
  logError(message: string): void
  cancel(message: string): void
  selectPackageManager(): Promise<PackageManager | null>
  selectTechnologies(options: { value: string; label: string }[]): Promise<string[] | null>
  selectLinter(options: { value: string; label: string }[]): Promise<string | null>
  selectFormatter(options: { value: string; label: string }[]): Promise<string | null>
  confirmInstall(deps: string[]): Promise<boolean | null>
  startSpinner(message: string): void
  stopSpinner(message: string): void
}

export interface ConfigWriter {
  writeLinterConfig(linter: string, plugins: string[], cwd: string): void
  writeFormatterConfig(formatter: string, plugins: string[], cwd: string): void
}

export interface PackageInstaller {
  install(pm: PackageManager, deps: string[], cwd: string): void
}
