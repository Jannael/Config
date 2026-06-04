import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FORMAT_CONFIG } from '@/constants/format-config'

export function generateOxfmt({ cwd }: { cwd: string }): void {
  const config = {
    $schema: './node_modules/oxfmt/configuration_schema.json',
    lineWidth: FORMAT_CONFIG.lineWidth,
    indentStyle: FORMAT_CONFIG.indentStyle,
    indentWidth: FORMAT_CONFIG.indentWidth,
    semicolons: FORMAT_CONFIG.semicolons,
    singleQuote: FORMAT_CONFIG.useSingleQuote,
    useTabs: FORMAT_CONFIG.useTabs,
  }

  writeFileSync(join(cwd, '.oxfmtrc.json'), JSON.stringify(config, null, 2) + '\n')
}
