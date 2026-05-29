import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateOxlint(oxlintPlugins: string[], cwd: string): void {
  const config: Record<string, unknown> = {
    $schema: './node_modules/oxlint/configuration_schema.json',
    plugins: oxlintPlugins.length > 0 ? oxlintPlugins : undefined,
    rules: {
      'no-unused-vars': 'warn',
    },
  }

  writeFileSync(join(cwd, '.oxlintrc.json'), JSON.stringify(config, null, 2) + '\n')
}
