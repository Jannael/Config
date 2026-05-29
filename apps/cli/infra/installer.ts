import { execSync } from 'node:child_process'
import type { PackageInstaller } from '@/domain/ports'
import type { PackageManager } from '@/domain/types'

const installCommands: Record<PackageManager, string[]> = {
  npm: ['npm', 'install', '-D'],
  bun: ['bun', 'add', '-d'],
  pnpm: ['pnpm', 'add', '-D'],
  yarn: ['yarn', 'add', '-D'],
}

export class NpmInstaller implements PackageInstaller {
  install({ pm, deps, cwd }: { pm: PackageManager; deps: string[]; cwd: string }): void {
    const [cmd, ...args] = installCommands[pm]!
    const fullCommand = [cmd, ...args, ...deps].join(' ')
    execSync(fullCommand, { cwd, stdio: 'inherit' })
  }
}
