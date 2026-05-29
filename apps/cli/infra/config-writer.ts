import type { ConfigWriter } from '@/domain/ports'
import { generateEslint } from '@/infra/generators/eslint'
import { generatePrettier } from '@/infra/generators/prettier'
import { generateBiome } from '@/infra/generators/biome'
import { generateOxlint } from '@/infra/generators/oxlint'
import { generateOxfmt } from '@/infra/generators/oxfmt'

export class FileConfigWriter implements ConfigWriter {
  writeLinterConfig({
    linter,
    plugins,
    cwd,
  }: {
    linter: string
    plugins: string[]
    cwd: string
  }): void {
    switch (linter) {
      case 'eslint':
        generateEslint({ plugins, cwd })
        break
      case 'oxlint':
        generateOxlint({ plugins, cwd })
        break
      case 'biome':
        generateBiome({ cwd })
        break
    }
  }

  writeFormatterConfig({
    formatter,
    plugins,
    cwd,
  }: {
    formatter: string
    plugins: string[]
    cwd: string
  }): void {
    switch (formatter) {
      case 'prettier':
        generatePrettier({ plugins, cwd })
        break
      case 'oxfmt':
        generateOxfmt({ cwd })
        break
      case 'biome':
        generateBiome({ cwd })
        break
    }
  }
}
