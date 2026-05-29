import type { ConfigWriter } from '@/app/ports'
import { generateEslint } from '@/infra/eslint'
import { generatePrettier } from '@/infra/prettier'
import { generateBiome } from '@/infra/biome'
import { generateOxlint } from '@/infra/oxlint'
import { generateOxfmt } from '@/infra/oxfmt'

export class FileConfigWriter implements ConfigWriter {
  writeLinterConfig(linter: string, plugins: string[], cwd: string): void {
    switch (linter) {
      case 'eslint':
        generateEslint(plugins, cwd)
        break
      case 'oxlint':
        generateOxlint(plugins, cwd)
        break
      case 'biome':
        generateBiome(cwd)
        break
    }
  }

  writeFormatterConfig(formatter: string, plugins: string[], cwd: string): void {
    switch (formatter) {
      case 'prettier':
        generatePrettier(plugins, cwd)
        break
      case 'oxfmt':
        generateOxfmt(cwd)
        break
      case 'biome':
        generateBiome(cwd)
        break
    }
  }
}
