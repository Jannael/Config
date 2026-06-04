import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

// const baseConfig = {
//   semi: false,
//   singleQuote: true,
//   printWidth: 150,
// }

export function generatePrettier({
  plugins: formatterPlugins,
  cwd,
}: {
  plugins: string[]
  cwd: string
}): void {
  const config: Record<string, unknown> = {
    semi: false,
    singleQuote: true,
    printWidth: 150,
    useTabs: true,
  }

  if (formatterPlugins.length > 0) {
    config.plugins = formatterPlugins
  }

  writeFileSync(join(cwd, '.prettierrc'), JSON.stringify(config, null, 2) + '\n')
}
