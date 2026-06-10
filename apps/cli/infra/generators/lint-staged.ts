import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import commands from '@/configs/commands.json'

type LintStagedOptions = {
	linter: string
	formatter: string
	extensions: string[]
	cwd: string
}

const toolCommands = commands as Record<string, { commands: Record<string, string> }>

export function generateLintStaged({ linter, formatter, extensions, cwd }: LintStagedOptions): void {
	const cmds: string[] = []

	const linterCmd = toolCommands[linter]?.commands?.['lint:fix']
	if (linterCmd) cmds.push(linterCmd)

	const formatterCmd = toolCommands[formatter]?.commands?.fmt
	if (formatterCmd && formatterCmd !== linterCmd) cmds.push(formatterCmd)

	const sortedExtensions = [...extensions].sort()
	const filePattern = sortedExtensions.length > 0 ? `*.{${sortedExtensions.join(',')}}` : '*.{js,jsx,ts,tsx}'

	const config: Record<string, string[]> = {
		[filePattern]: cmds,
	}

	writeFileSync(join(cwd, '.lintstagedrc.json'), JSON.stringify(config, null, 2) + '\n')
}
