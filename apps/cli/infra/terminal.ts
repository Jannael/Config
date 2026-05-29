import * as p from '@clack/prompts'
import type { Terminal } from '../app/ports'
import type { PackageManager } from '../domain/types'

export class ClackTerminal implements Terminal {
  intro(title: string): void {
    p.intro(title)
  }

  outro(message: string): void {
    p.outro(message)
  }

  logInfo(message: string): void {
    p.log.info(message)
  }

  logError(message: string): void {
    p.log.error(message)
  }

  cancel(message: string): void {
    p.cancel(message)
  }

  async selectPackageManager(): Promise<PackageManager | null> {
    const result = await p.select({
      message: 'Select your package manager',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'bun', label: 'bun' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    })
    if (p.isCancel(result)) return null
    return result as PackageManager
  }

  async selectTechnologies(options: { value: string; label: string }[]): Promise<string[] | null> {
    const result = await p.multiselect({
      message: 'Select your technologies',
      options,
      required: true,
    })
    if (p.isCancel(result)) return null
    return result as string[]
  }

  async selectLinter(options: { value: string; label: string }[]): Promise<string | null> {
    const result = await p.select({ message: 'Select your linter', options })
    if (p.isCancel(result)) return null
    return result as string
  }

  async selectFormatter(options: { value: string; label: string }[]): Promise<string | null> {
    const result = await p.select({ message: 'Select your formatter', options })
    if (p.isCancel(result)) return null
    return result as string
  }

  async confirmInstall(deps: string[]): Promise<boolean | null> {
    const result = await p.confirm({
      message: `The following dependencies will be installed:\n${deps.join(', ')}\n\nContinue?`,
      initialValue: true,
    })
    if (p.isCancel(result)) return null
    return result as boolean
  }

  startSpinner(message: string): void {
    this._spinner = p.spinner()
    this._spinner.start(message)
  }

  stopSpinner(message: string): void {
    this._spinner?.stop(message)
  }

  private _spinner: ReturnType<typeof p.spinner> | null = null
}
