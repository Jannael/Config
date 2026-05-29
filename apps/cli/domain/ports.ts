import type { PackageManager } from '@/domain/types'

export interface Terminal {
  intro({ title }: { title: string }): void
  outro({ message }: { message: string }): void
  logInfo({ message }: { message: string }): void
  logError({ message }: { message: string }): void
  cancel({ message }: { message: string }): void
  selectPackageManager(): Promise<PackageManager | null>
  selectTechnologies({
    options,
  }: {
    options: { value: string; label: string }[]
  }): Promise<string[] | null>
  selectLinter({ options }: { options: { value: string; label: string }[] }): Promise<string | null>
  selectFormatter({
    options,
  }: {
    options: { value: string; label: string }[]
  }): Promise<string | null>
  confirmInstall({ deps }: { deps: string[] }): Promise<boolean | null>
  startSpinner({ message }: { message: string }): void
  stopSpinner({ message }: { message: string }): void
}

export interface ConfigWriter {
  writeLinterConfig({
    linter,
    plugins,
    cwd,
  }: {
    linter: string
    plugins: string[]
    cwd: string
  }): void
  writeFormatterConfig({
    formatter,
    plugins,
    cwd,
  }: {
    formatter: string
    plugins: string[]
    cwd: string
  }): void
}

export interface PackageInstaller {
  install({ pm, deps, cwd }: { pm: PackageManager; deps: string[]; cwd: string }): void
}

export interface PackageManagerDetector {
  detect(): PackageManager | null
}
