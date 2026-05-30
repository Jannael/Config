import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generateLintStaged } from '@/infra/generators/lint-staged'

describe('generateLintStaged', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('eslint + prettier config', () => {
    /*
      Flow:
      1. Call generateLintStaged with eslint, prettier and extensions
      2. Verify writeFileSync called with .lintstagedrc.json path
      3. Verify config contains both eslint --fix and prettier --write commands
      4. Verify file pattern uses the provided extensions
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'eslint', formatter: 'prettier', extensions: ['js', 'ts'], cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, '.lintstagedrc.json'))

    const config = JSON.parse(content as string)
    expect(config['*.{js,ts}']).toEqual(['eslint --fix', 'prettier --write'])
  })

  it('oxlint + oxfmt config', () => {
    /*
      Flow:
      1. Call generateLintStaged with oxlint, oxfmt and extensions
      2. Verify config contains oxlint --fix and oxfmt commands
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'oxlint', formatter: 'oxfmt', extensions: ['jsx', 'tsx'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{jsx,tsx}']).toEqual(['oxlint --fix', 'oxfmt'])
  })

  it('biome linter + formatter config', () => {
    /*
      Flow:
      1. Call generateLintStaged with biome for both linter and formatter
      2. Verify config contains both biome check --write and biome format --write
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'biome', formatter: 'biome', extensions: ['ts'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{ts}']).toEqual(['biome check --write', 'biome format --write'])
  })

  it('eslint + oxfmt config', () => {
    /*
      Flow:
      1. Call generateLintStaged with eslint and oxfmt
      2. Verify config contains eslint --fix and oxfmt commands
    */
    const cwd = '/test/project'
    generateLintStaged({
      linter: 'eslint',
      formatter: 'oxfmt',
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      cwd,
    })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['eslint --fix', 'oxfmt'])
  })

  it('oxlint + prettier config', () => {
    /*
      Flow:
      1. Call generateLintStaged with oxlint and prettier
      2. Verify config contains oxlint --fix and prettier --write commands
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'oxlint', formatter: 'prettier', extensions: ['vue', 'ts'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{ts,vue}']).toEqual(['oxlint --fix', 'prettier --write'])
  })

  it('empty extensions uses default pattern', () => {
    /*
      Flow:
      1. Call generateLintStaged with empty extensions array
      2. Verify config uses default file pattern *.{js,jsx,ts,tsx}
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'eslint', formatter: 'prettier', extensions: [], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['eslint --fix', 'prettier --write'])
  })
})
