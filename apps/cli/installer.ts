import { execSync } from 'node:child_process'

export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn'

const installCommands: Record<PackageManager, string[]> = {
  npm: ['npm', 'install', '-D'],
  bun: ['bun', 'add', '-d'],
  pnpm: ['pnpm', 'add', '-D'],
  yarn: ['yarn', 'add', '-D'],
}

export function install(pm: PackageManager, deps: string[], cwd: string): void {
  const [cmd, ...args] = installCommands[pm]!
  const fullCommand = [cmd, ...args, ...deps].join(' ')
  execSync(fullCommand, { cwd, stdio: 'inherit' })
}
