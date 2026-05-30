import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type PackageScriptsOptions = {
  linter: string
  formatter: string
  cwd: string
}

const linterCommands: Record<string, { lint: string; lintFix: string }> = {
  eslint: {
    lint: 'eslint .',
    lintFix: 'eslint . --fix',
  },
  oxlint: {
    lint: 'oxlint',
    lintFix: 'oxlint --fix',
  },
  biome: {
    lint: 'biome check',
    lintFix: 'biome check --write',
  },
}

const formatterCommands: Record<string, { fmt: string; fmtCheck: string }> = {
  prettier: {
    fmt: 'prettier --write .',
    fmtCheck: 'prettier --check .',
  },
  oxfmt: {
    fmt: 'oxfmt --write .',
    fmtCheck: 'oxfmt --check .',
  },
  biome: {
    fmt: 'biome format --write',
    fmtCheck: 'biome format --check',
  },
}

export function generatePackageScripts({ linter, formatter, cwd }: PackageScriptsOptions): void {
  const packageJsonPath = join(cwd, 'package.json')
  const content = readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(content)

  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  const linterCmd = linterCommands[linter]
  if (linterCmd) {
    packageJson.scripts.lint = linterCmd.lint
    packageJson.scripts['lint:fix'] = linterCmd.lintFix
  }

  const formatterCmd = formatterCommands[formatter]
  if (formatterCmd) {
    packageJson.scripts.fmt = formatterCmd.fmt
    packageJson.scripts['fmt:check'] = formatterCmd.fmtCheck
  }

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
}
