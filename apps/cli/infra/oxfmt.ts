import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateOxfmt(cwd: string): void {
  const config = {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    lineWidth: 100,
    indentStyle: 'space',
    indentWidth: 2,
    semicolons: false,
    quoteStyle: 'single',
  }

  writeFileSync(join(cwd, '.oxfmtrc.json'), JSON.stringify(config, null, 2) + '\n')
}
