import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'jsonc-parser'
import editorConfig from '@/configs/editor-config.json'
import configs from 'configs'

type VscodeSettingsOptions = {
	formatter: string
	linter: string
	techs: string[]
	cwd: string
}

const toolConfigs = editorConfig as Record<string, { editorConfig: Record<string, unknown> }>

export function generateVscodeSettings({ formatter, linter, techs, cwd }: VscodeSettingsOptions): void {
	const vscodeDir = join(cwd, '.vscode')
	const settingsPath = join(vscodeDir, 'settings.json')

	let settings: Record<string, unknown> = {}

	if (existsSync(settingsPath)) {
		const content = readFileSync(settingsPath, 'utf-8')
		settings = parse(content) || {}
	}

	for (const tech of techs) {
		const techConfig = configs.techs[tech as keyof typeof configs.techs]
		const techEditorConfig = (techConfig as { editorConfig?: Record<string, unknown> })?.editorConfig
		if (techEditorConfig) {
			Object.assign(settings, techEditorConfig)
		}
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
