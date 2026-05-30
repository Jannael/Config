import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

import { execSync } from 'node:child_process'
import { FileConfigRepository } from '@/infra/config-repository'

describe('initHusky', () => {
  let repo: FileConfigRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new FileConfigRepository()
  })

  it('npm husky init command', () => {
    /*
      Flow:
      1. Call initHusky with 'npm' package manager
      2. Verify execSync called with npx husky init
    */
    repo.initHusky('npm', '/test/project')

    expect(execSync).toHaveBeenCalledWith('npx husky init', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('bun husky init command', () => {
    /*
      Flow:
      1. Call initHusky with 'bun' package manager
      2. Verify execSync called with bunx husky init
    */
    repo.initHusky('bun', '/test/project')

    expect(execSync).toHaveBeenCalledWith('bunx husky init', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('pnpm husky init command', () => {
    /*
      Flow:
      1. Call initHusky with 'pnpm' package manager
      2. Verify execSync called with pnpx husky init
    */
    repo.initHusky('pnpm', '/test/project')

    expect(execSync).toHaveBeenCalledWith('pnpx husky init', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('yarn husky init command', () => {
    /*
      Flow:
      1. Call initHusky with 'yarn' package manager
      2. Verify execSync called with yarn dlx husky init
    */
    repo.initHusky('yarn', '/test/project')

    expect(execSync).toHaveBeenCalledWith('yarn dlx husky init', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })
})
