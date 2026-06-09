import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { Select } from '@/utils/select'

export type PackageManager = 'bun' | 'pnpm' | 'yarn' | 'npm'

let cached: PackageManager | null = null

function detectFromLockfile({ cwd }: { cwd?: string } = {}): PackageManager | null {
  const dir = cwd ?? process.cwd()

  if (existsSync(join(dir, 'bun.lock')) || existsSync(join(dir, 'bun.lockb'))) return 'bun'
  if (existsSync(join(dir, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(dir, 'yarn.lock'))) return 'yarn'
  if (existsSync(join(dir, 'package-lock.json'))) return 'npm'
  return null
}

export async function resolvePackageManager({
  cwd,
}: { cwd?: string } = {}): Promise<PackageManager> {
  if (cached) return cached

  const detected = detectFromLockfile({ cwd })
  if (detected) {
    cached = detected
    return cached
  }

  const selected = await Select({
    message: 'No lockfile found. Which package manager do you want to use?',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'yarn', label: 'yarn' },
      { value: 'bun', label: 'bun' },
    ],
  })

  cached = selected as PackageManager
  return cached
}

const INSTALL_CMD: Record<PackageManager, string> = {
  bun: 'bun add -D',
  pnpm: 'pnpm add -D',
  yarn: 'yarn add -D',
  npm: 'npm install -D',
}

const EXEC_CMD: Record<PackageManager, string> = {
  bun: 'bunx',
  pnpm: 'pnpm exec',
  yarn: 'yarn exec',
  npm: 'npx',
}

export function getInstallCommand({ pm }: { pm: PackageManager }): string {
  return INSTALL_CMD[pm]
}

export function getExecCommand({ pm }: { pm: PackageManager }): string {
  return EXEC_CMD[pm]
}
