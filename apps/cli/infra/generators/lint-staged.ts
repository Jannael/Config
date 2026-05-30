import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

type LintStagedOptions = {
  linter: string
  formatter: string
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

export function generateLintStaged({ linter, formatter, cwd }: LintStagedOptions): void {
  const commands: string[] = []

  const linterCmd = linterCommands[linter]
  if (linterCmd) commands.push(linterCmd)

  const formatterCmd = formatterCommands[formatter]
  if (formatterCmd && formatterCmd !== linterCmd) commands.push(formatterCmd)

  const config: Record<string, string[]> = {
    '*.{js,jsx,ts,tsx}': commands,
  }

  writeFileSync(join(cwd, '.lintstagedrc.json'), JSON.stringify(config, null, 2) + '\n')
}
