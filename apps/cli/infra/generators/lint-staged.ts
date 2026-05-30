import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

type LintStagedOptions = {
  linter: string
  formatter: string
  extensions: string[]
  cwd: string
}

const linterCommands: Record<string, string> = {
  eslint: 'eslint --fix',
  oxlint: 'oxlint --fix',
  biome: 'biome check --write',
}

const formatterCommands: Record<string, string> = {
  prettier: 'prettier --write',
  oxfmt: 'oxfmt',
  biome: 'biome format --write',
}

export function generateLintStaged({ linter, formatter, extensions, cwd }: LintStagedOptions): void {
  const commands: string[] = []

  const linterCmd = linterCommands[linter]
  if (linterCmd) commands.push(linterCmd)

  const formatterCmd = formatterCommands[formatter]
  if (formatterCmd && formatterCmd !== linterCmd) commands.push(formatterCmd)

  const sortedExtensions = [...extensions].sort()
  const filePattern = sortedExtensions.length > 0 ? `*.{${sortedExtensions.join(',')}}` : '*.{js,jsx,ts,tsx}'

  const config: Record<string, string[]> = {
    [filePattern]: commands,
  }

  writeFileSync(join(cwd, '.lintstagedrc.json'), JSON.stringify(config, null, 2) + '\n')
}
