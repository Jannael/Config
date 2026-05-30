import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'jsonc-parser'

const formatterExtensionIds: Record<string, string> = {
  biome: 'biomejs.biome',
  prettier: 'esbenp.prettier-vscode',
  oxfmt: 'oxc.oxc-vscode',
}

type VscodeSettingsOptions = {
  formatter: string
  cwd: string
}

export function generateVscodeSettings({ formatter, cwd }: VscodeSettingsOptions): void {
  const vscodeDir = join(cwd, '.vscode')
  const settingsPath = join(vscodeDir, 'settings.json')

  const extensionId = formatterExtensionIds[formatter]
  if (!extensionId) return

  let settings: Record<string, unknown> = {}

  if (existsSync(settingsPath)) {
    const content = readFileSync(settingsPath, 'utf-8')
    settings = parse(content) || {}
  }

  settings['editor.defaultFormatter'] = extensionId

  if (!('editor.formatOnSave' in settings)) {
    settings['editor.formatOnSave'] = true
  }

  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true })
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}
