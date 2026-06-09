import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FORMAT_CONFIG } from '@/constants/format-config'

export function generateBiome({ cwd }: { cwd: string }): void {
  const config = {
    $schema: 'https://biomejs.dev/schemas/2.4.16/schema.json',
    formatter: {
      enabled: true,
      lineWidth: FORMAT_CONFIG.lineWidth,
      indentStyle: FORMAT_CONFIG.indentStyle,
      indentWidth: FORMAT_CONFIG.indentWidth,
    },
    javascript: {
      formatter: {
        semicolons: 'asNeeded',
        quoteStyle: FORMAT_CONFIG.quoteStyle,
      },
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
      },
    },
  }

  writeFileSync(join(cwd, 'biome.json'), JSON.stringify(config, null, 2) + '\n')
}
