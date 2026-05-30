import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import type { ConfigRepository } from '@/domain/repository'
import type { PackageManager } from '@/domain/types'
import { generateEslint } from '@/infra/generators/eslint'
import { generateBiome } from '@/infra/generators/biome'
import { generateOxlint } from '@/infra/generators/oxlint'
import { generateOxfmt } from '@/infra/generators/oxfmt'
import { generatePrettier } from '@/infra/generators/prettier'

const installCommands: Record<PackageManager, string[]> = {
  npm: ['npm', 'install', '-D'],
  bun: ['bun', 'add', '-d'],
  pnpm: ['pnpm', 'add', '-D'],
  yarn: ['yarn', 'add', '-D'],
}

export class FileConfigRepository implements ConfigRepository {
  writeFile(path: string, content: string): void {
    writeFileSync(path, content)
  }

  configEslint(plugins: string[], cwd: string): void {
    generateEslint({ plugins, cwd })
  }

  configBiome(cwd: string): void {
    generateBiome({ cwd })
  }

  configOxlint(plugins: string[], cwd: string): void {
    generateOxlint({ plugins, cwd })
  }

  configOxfmt(cwd: string): void {
    generateOxfmt({ cwd })
  }

  configPrettier(plugins: string[], cwd: string): void {
    generatePrettier({ plugins, cwd })
  }

  install(pm: PackageManager, deps: string[], cwd: string): void {
    const [cmd, ...args] = installCommands[pm]!
    const fullCommand = [cmd, ...args, ...deps].join(' ')
    execSync(fullCommand, { cwd, stdio: 'inherit' })
  }
}
