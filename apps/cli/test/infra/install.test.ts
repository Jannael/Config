import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

import { execSync } from 'node:child_process'
import { FileConfigRepository } from '@/infra/config-repository'

describe('install', () => {
  let repo: FileConfigRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new FileConfigRepository()
  })

  it('npm install command', () => {
    /*
      Flow:
      1. Call install with 'npm' package manager
      2. Verify execSync called with npm install -D command
    */
    const deps = ['eslint', 'prettier']
    repo.install('npm', deps, '/test/project')

    expect(execSync).toHaveBeenCalledWith('npm install -D eslint prettier', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('bun install command', () => {
    /*
      Flow:
      1. Call install with 'bun' package manager
      2. Verify execSync called with bun add -d command
    */
    const deps = ['eslint', 'prettier']
    repo.install('bun', deps, '/test/project')

    expect(execSync).toHaveBeenCalledWith('bun add -d eslint prettier', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('pnpm install command', () => {
    /*
      Flow:
      1. Call install with 'pnpm' package manager
      2. Verify execSync called with pnpm add -D command
    */
    const deps = ['eslint']
    repo.install('pnpm', deps, '/test/project')

    expect(execSync).toHaveBeenCalledWith('pnpm add -D eslint', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('yarn install command', () => {
    /*
      Flow:
      1. Call install with 'yarn' package manager
      2. Verify execSync called with yarn add -D command
    */
    const deps = ['eslint', 'prettier', 'typescript-eslint']
    repo.install('yarn', deps, '/test/project')

    expect(execSync).toHaveBeenCalledWith('yarn add -D eslint prettier typescript-eslint', {
      cwd: '/test/project',
      stdio: 'inherit',
    })
  })

  it('multiple dependencies joined correctly', () => {
    /*
      Flow:
      1. Call install with multiple dependencies
      2. Verify all dependencies are joined with spaces in command
    */
    const deps = ['eslint', '@eslint/js', 'eslint-plugin-react', 'prettier']
    repo.install('npm', deps, '/test/project')

    expect(execSync).toHaveBeenCalledWith(
      'npm install -D eslint @eslint/js eslint-plugin-react prettier',
      expect.any(Object),
    )
  })
})
