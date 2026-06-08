import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { extensionLinks } from '@/configs/editor-extensions'
import type { Formatters, Linters } from '@/configs/types'
import { type Repository as IRepository } from '@/domain/repository'
import configs from 'configs'
import { generateBiome } from '@/infra/generators/biome'
import { generateOxfmt } from '@/infra/generators/formatters/oxfmt'
import { generatePrettier } from '@/infra/generators/formatters/prettier'
import { generateLintStaged } from '@/infra/generators/lint-staged'
import { generateEslint } from '@/infra/generators/linters/eslint'
import { generateOxlint } from '@/infra/generators/linters/oxlint'
import { generatePackageScripts } from '@/infra/generators/package-scripts'
import { generateVscodeSettings } from '@/infra/generators/vscode-settings'
import { getInstallCommand, resolvePackageManager } from './pm-detector'

export class Repository implements IRepository {
  private readonly cwd = process.cwd()

  private collectLinterPlugins(techs: string[], linter: string): string[] {
    const plugins: string[] = []
    for (const tech of techs) {
      const config = configs.techs[tech as keyof typeof configs.techs]
      const linterConfig = (config?.linter as Record<string, { plugins?: string[] }>)?.[linter]
      if (linterConfig?.plugins) plugins.push(...linterConfig.plugins)
    }
    return [...new Set(plugins)]
  }

  private collectFormatterPlugins(techs: string[], formatter: string): string[] {
    const plugins: string[] = []
    for (const tech of techs) {
      const config = configs.techs[tech as keyof typeof configs.techs]
      const formatterConfig = (config?.formatter as Record<string, { plugins?: string[] }>)?.[
        formatter
      ]
      if (formatterConfig?.plugins) plugins.push(...formatterConfig.plugins)
    }
    return [...new Set(plugins)]
  }

  private collectFileExtensions(techs: string[]): string[] {
    const extensions = new Set<string>()
    for (const tech of techs) {
      const config = configs.techs[tech as keyof typeof configs.techs]
      const eslintConfig = config?.linter?.eslint as
        | { config?: { fileExtensions?: string[] } }
        | undefined
      eslintConfig?.config?.fileExtensions?.forEach((ext) => extensions.add(ext.replace(/^\./, '')))
    }
    return [...extensions]
  }

  async installDependencies({ dependencies }: { dependencies: string[] }): Promise<void> {
    if (dependencies.length === 0) return
    const pm = await resolvePackageManager()
    const cmd = `${getInstallCommand({ pm })} ${dependencies.join(' ')}`
    execSync(cmd, { stdio: 'inherit' })
  }

  async writeBiomeConfig(): Promise<void> {
    generateBiome({ cwd: this.cwd })
  }

  async writePrettierConfig(techs: string[]): Promise<void> {
    const plugins = this.collectFormatterPlugins(techs, 'prettier')
    generatePrettier({ plugins, cwd: this.cwd })
  }

  private collectEslintConfig(techs: string[]): {
    importStatements: string[]
    configSpread: string[]
    ignorePatterns: string[]
    fileExtensions: string[]
  } {
    const importStatements = new Set<string>()
    const configSpread = new Set<string>()
    const ignorePatterns = new Set<string>()
    const fileExtensions = new Set<string>()

    for (const tech of techs) {
      const config = configs.techs[tech as keyof typeof configs.techs]
      const eslintConfig = config?.linter?.eslint as
        | {
            config?: {
              importStatements?: string[]
              configSpread?: string[]
              ignorePatterns?: string[]
              fileExtensions?: string[]
            }
          }
        | undefined

      if (!eslintConfig?.config) continue

      eslintConfig.config.importStatements?.forEach((s) => importStatements.add(s))
      eslintConfig.config.configSpread?.forEach((s) => configSpread.add(s))
      eslintConfig.config.ignorePatterns?.forEach((s) => ignorePatterns.add(s))
      eslintConfig.config.fileExtensions?.forEach((s) => fileExtensions.add(s))
    }

    return {
      importStatements: [...importStatements],
      configSpread: [...configSpread],
      ignorePatterns: [...ignorePatterns],
      fileExtensions: [...fileExtensions],
    }
  }

  async writeEslintConfig(techs: string[]): Promise<void> {
    const eslintConfig = this.collectEslintConfig(techs)
    generateEslint({ ...eslintConfig, cwd: this.cwd })
  }

  async writeOxLintConfig(techs: string[]): Promise<void> {
    const plugins = this.collectLinterPlugins(techs, 'oxlint')
    generateOxlint({ plugins, cwd: this.cwd })
  }

  async writeOxFmtConfig(): Promise<void> {
    generateOxfmt({ cwd: this.cwd })
  }

  async writeLintStagedConfig(
    formatter: Formatters,
    linter: Linters,
    techs: string[],
  ): Promise<void> {
    const extensions = this.collectFileExtensions(techs)
    generateLintStaged({ linter, formatter, extensions, cwd: this.cwd })
  }

  async writeEditorConfig(formatter: Formatters, linter: Linters): Promise<void> {
    generateVscodeSettings({ formatter, linter, cwd: this.cwd })
  }

  async writePackageJsonScripts(formatter: Formatters, linter: Linters): Promise<void> {
    generatePackageScripts({ linter, formatter, cwd: this.cwd })
  }

  async getEditorExtensions(
    formatter: Formatters,
    linter: Linters,
  ): Promise<{ name: string; vsc: string; vsx: string }[]> {
    const result: { name: string; vsc: string; vsx: string }[] = []
    const linterLink = extensionLinks[linter as keyof typeof extensionLinks]
    const formatterLink = extensionLinks[formatter as keyof typeof extensionLinks]
    if (linterLink) result.push(linterLink)
    if (formatterLink) result.push(formatterLink)
    return result
  }

  getAutoApproveFlag(): boolean {
    return process.argv.includes('--yes') || process.argv.includes('-y')
  }

  async initHusky(): Promise<void> {
    const huskyDir = join(this.cwd, '.husky')
    if (!existsSync(huskyDir)) {
      mkdirSync(huskyDir, { recursive: true })
    }
    writeFileSync(join(huskyDir, 'pre-commit'), 'npx lint-staged\n')
  }
}
