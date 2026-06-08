import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import commands from '@/configs/commands.json'

type PackageScriptsOptions = {
  linter: string
  formatter: string
  cwd: string
}

const toolCommands = commands as Record<string, { commands: Record<string, string> }>

export function generatePackageScripts({ linter, formatter, cwd }: PackageScriptsOptions): void {
  const packageJsonPath = join(cwd, 'package.json')
  const content = readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(content)

  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  const linterCmd = toolCommands[linter]?.commands
  if (linterCmd) {
    packageJson.scripts.lint = `${linterCmd.lint} .`
    packageJson.scripts['lint:fix'] = `${linterCmd['lint:fix']} .`
  }

  const formatterCmd = toolCommands[formatter]?.commands
  if (formatterCmd) {
    packageJson.scripts.fmt = `${formatterCmd.fmt} .`
    packageJson.scripts['fmt:check'] = `${formatterCmd['fmt:check']} .`
  }

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
}
