import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FORMAT_CONFIG } from '@/constants/format-config'

export function generatePrettier({ plugins: formatterPlugins, cwd }: { plugins: string[]; cwd: string }): void {
	const config: Record<string, unknown> = {
		semi: FORMAT_CONFIG.semicolons,
		singleQuote: FORMAT_CONFIG.useSingleQuote,
		printWidth: FORMAT_CONFIG.lineWidth,
		useTabs: FORMAT_CONFIG.useTabs,
	}

	if (formatterPlugins.length > 0) {
		config.plugins = formatterPlugins
	}

	writeFileSync(join(cwd, '.prettierrc'), JSON.stringify(config, null, 2) + '\n')
}
