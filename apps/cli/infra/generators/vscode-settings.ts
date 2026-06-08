import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'jsonc-parser'
import editorConfig from '@/configs/editor-config.json'

type VscodeSettingsOptions = {
  formatter: string
  linter: string
  cwd: string
}

const toolConfigs = editorConfig as Record<string, { editorConfig: Record<string, unknown> }>

export function generateVscodeSettings({ formatter, linter, cwd }: VscodeSettingsOptions): void {
  const vscodeDir = join(cwd, '.vscode')
  const settingsPath = join(vscodeDir, 'settings.json')

  let settings: Record<string, unknown> = {}

  if (existsSync(settingsPath)) {
    const content = readFileSync(settingsPath, 'utf-8')
    settings = parse(content) || {}
  }

  const linterConfig = toolConfigs[linter]?.editorConfig
  if (linterConfig) {
    Object.assign(settings, linterConfig)
  }

  const formatterConfig = toolConfigs[formatter]?.editorConfig
  if (formatterConfig) {
    Object.assign(settings, formatterConfig)
  }

  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true })
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
}
