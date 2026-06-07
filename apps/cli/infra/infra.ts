import { execSync } from 'node:child_process'
import type { Formatters, Linters } from '@/configs/types'
import { type Repository as IRepository } from '@/domain/repository'
import { getInstallCommand, resolvePackageManager } from './pm-detector'

export class Repository implements IRepository {
  constructor() {}

  async installDependencies({ dependencies }: { dependencies: string[] }): Promise<void> {
    if (dependencies.length === 0) return
    const pm = await resolvePackageManager()
    const cmd = `${getInstallCommand({ pm })} ${dependencies.join(' ')}`
    execSync(cmd, { stdio: 'inherit' })
  }

  async writeBiomeConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }
  async writePrettierConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }
  async writeEslintConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }
  async writeOxLintConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }
  async writeOxFmtConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }

  async writeLintStagedConfig(
    formatter: Formatters,
    linter: Linters,
    techs: string[],
  ): Promise<void> {
    console.log(formatter, linter, techs)
  }
  async writeEditorConfig(techs: string[]): Promise<void> {
    console.log(techs)
  }

  async writePackageJsonScripts(formatter: Formatters, linter: Linters): Promise<void> {
    console.log(formatter, linter)
  }
  async getEditorExtensions(
    formatter: Formatters,
    linter: Linters,
  ): Promise<{ name: string; vsc: string; vsx: string }[]> {
    console.log(formatter, linter)
    return []
  }

  getAutoApproveFlag(): boolean {
    return false
  }
  async initHusky(): Promise<void> {}
}
