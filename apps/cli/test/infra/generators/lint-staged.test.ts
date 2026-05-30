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
      1. Call generateLintStaged with eslint and prettier
      2. Verify writeFileSync called with .lintstagedrc.json path
      3. Verify config contains both eslint --fix and prettier --write commands
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'eslint', formatter: 'prettier', cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, '.lintstagedrc.json'))

    const config = JSON.parse(content as string)
    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['eslint --fix', 'prettier --write'])
  })

  it('oxlint + oxfmt config', () => {
    /*
      Flow:
      1. Call generateLintStaged with oxlint and oxfmt
      2. Verify config contains oxlint --fix and oxfmt commands
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'oxlint', formatter: 'oxfmt', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['oxlint --fix', 'oxfmt'])
  })

  it('biome linter + formatter config', () => {
    /*
      Flow:
      1. Call generateLintStaged with biome for both linter and formatter
      2. Verify config contains only biome check --write (no duplicate)
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'biome', formatter: 'biome', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['biome check --write', 'biome format --write'])
  })

  it('eslint + oxfmt config', () => {
    /*
      Flow:
      1. Call generateLintStaged with eslint and oxfmt
      2. Verify config contains eslint --fix and oxfmt commands
    */
    const cwd = '/test/project'
    generateLintStaged({ linter: 'eslint', formatter: 'oxfmt', cwd })

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
    generateLintStaged({ linter: 'oxlint', formatter: 'prettier', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config['*.{js,jsx,ts,tsx}']).toEqual(['oxlint --fix', 'prettier --write'])
  })
})
