import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateBiome({ cwd }: { cwd: string }): void {
  const config = {
    $schema: 'https://biomejs.dev/schemas/2.0.0/schema.json',
    formatter: {
      enabled: true,
      lineWidth: 100,
      indentStyle: 'space',
      indentWidth: 2,
    },
    javascript: {
      formatter: {
        semicolons: 'asNeeded',
        quoteStyle: 'single',
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
