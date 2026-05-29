import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generatePrettier(formatterPlugins: string[], cwd: string): void {
  const config: Record<string, unknown> = {
    semi: false,
    singleQuote: true,
    printWidth: 100,
  }

  if (formatterPlugins.length > 0) {
    config.plugins = formatterPlugins
  }

  writeFileSync(join(cwd, '.prettierrc'), JSON.stringify(config, null, 2) + '\n')
}
