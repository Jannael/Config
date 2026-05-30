import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

import { readFileSync, writeFileSync } from 'node:fs'
import { generatePackageScripts } from '@/infra/generators/package-scripts'

describe('generatePackageScripts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('eslint + prettier scripts', () => {
    /*
      Flow:
      1. Mock readFileSync to return a basic package.json
      2. Call generatePackageScripts with eslint and prettier
      3. Verify writeFileSync called with package.json path
      4. Verify lint, lint:fix, fmt, and fmt:check scripts are added
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue('{"name": "test", "scripts": {}}')

    generatePackageScripts({ linter: 'eslint', formatter: 'prettier', cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, 'package.json'))

    const packageJson = JSON.parse(content as string)
    expect(packageJson.scripts.lint).toBe('eslint .')
    expect(packageJson.scripts['lint:fix']).toBe('eslint . --fix')
    expect(packageJson.scripts.fmt).toBe('prettier --write .')
    expect(packageJson.scripts['fmt:check']).toBe('prettier --check .')
  })

  it('oxlint + oxfmt scripts', () => {
    /*
      Flow:
      1. Mock readFileSync to return a basic package.json
      2. Call generatePackageScripts with oxlint and oxfmt
      3. Verify oxlint and oxfmt scripts are added
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue('{"name": "test", "scripts": {}}')

    generatePackageScripts({ linter: 'oxlint', formatter: 'oxfmt', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const packageJson = JSON.parse(content as string)

    expect(packageJson.scripts.lint).toBe('oxlint')
    expect(packageJson.scripts['lint:fix']).toBe('oxlint --fix')
    expect(packageJson.scripts.fmt).toBe('oxfmt --write .')
    expect(packageJson.scripts['fmt:check']).toBe('oxfmt --check .')
  })

  it('biome linter + formatter scripts', () => {
    /*
      Flow:
      1. Mock readFileSync to return a basic package.json
      2. Call generatePackageScripts with biome for both linter and formatter
      3. Verify biome check and biome format scripts are added
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue('{"name": "test", "scripts": {}}')

    generatePackageScripts({ linter: 'biome', formatter: 'biome', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const packageJson = JSON.parse(content as string)

    expect(packageJson.scripts.lint).toBe('biome check')
    expect(packageJson.scripts['lint:fix']).toBe('biome check --write')
    expect(packageJson.scripts.fmt).toBe('biome format --write')
    expect(packageJson.scripts['fmt:check']).toBe('biome format --check')
  })

  it('overwrites existing scripts', () => {
    /*
      Flow:
      1. Mock readFileSync to return a package.json with existing scripts
      2. Call generatePackageScripts with eslint and prettier
      3. Verify existing lint/fmt scripts are overwritten
      4. Verify other scripts are preserved
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue(
      '{"name": "test", "scripts": {"lint": "old-lint", "dev": "vite"}}',
    )

    generatePackageScripts({ linter: 'eslint', formatter: 'prettier', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const packageJson = JSON.parse(content as string)

    expect(packageJson.scripts.lint).toBe('eslint .')
    expect(packageJson.scripts['lint:fix']).toBe('eslint . --fix')
    expect(packageJson.scripts.fmt).toBe('prettier --write .')
    expect(packageJson.scripts['fmt:check']).toBe('prettier --check .')
    expect(packageJson.scripts.dev).toBe('vite')
  })

  it('creates scripts object if missing', () => {
    /*
      Flow:
      1. Mock readFileSync to return a package.json without scripts
      2. Call generatePackageScripts
      3. Verify scripts object is created and populated
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue('{"name": "test"}')

    generatePackageScripts({ linter: 'eslint', formatter: 'prettier', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const packageJson = JSON.parse(content as string)

    expect(packageJson.scripts).toBeDefined()
    expect(packageJson.scripts.lint).toBe('eslint .')
    expect(packageJson.scripts.fmt).toBe('prettier --write .')
  })

  it('preserves package.json structure', () => {
    /*
      Flow:
      1. Mock readFileSync to return a package.json with multiple fields
      2. Call generatePackageScripts
      3. Verify all original fields are preserved
    */
    const cwd = '/test/project'
    vi.mocked(readFileSync).mockReturnValue(
      '{"name": "test", "version": "1.0.0", "dependencies": {"react": "^18.0.0"}, "scripts": {"dev": "vite"}}',
    )

    generatePackageScripts({ linter: 'eslint', formatter: 'prettier', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const packageJson = JSON.parse(content as string)

    expect(packageJson.name).toBe('test')
    expect(packageJson.version).toBe('1.0.0')
    expect(packageJson.dependencies).toEqual({ react: '^18.0.0' })
    expect(packageJson.scripts.dev).toBe('vite')
    expect(packageJson.scripts.lint).toBe('eslint .')
  })
})
