import type { PackageManager } from '../domain/types'

export function detectPackageManager(): PackageManager | null {
  if (typeof process.versions.bun !== 'undefined') return 'bun'

  const binPath = process.argv[1] ?? ''
  if (binPath.includes('pnpm')) return 'pnpm'
  if (binPath.includes('yarn')) return 'yarn'
  if (binPath.includes('npx') || binPath.includes('npm')) return 'npm'

  const userAgent = process.env.npm_config_user_agent ?? ''
  if (userAgent.startsWith('pnpm')) return 'pnpm'
  if (userAgent.startsWith('yarn')) return 'yarn'
  if (userAgent.startsWith('npm')) return 'npm'

  return null
}
