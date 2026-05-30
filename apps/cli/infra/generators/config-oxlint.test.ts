import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generateOxlint } from '@/infra/generators/oxlint'

describe('generateOxlint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('oxlint config without plugins', () => {
    /*
      Flow:
      1. Call generateOxlint with empty plugins array
      2. Verify writeFileSync called with .oxlintrc.json path
      3. Verify plugins field is undefined when no plugins
    */
    const cwd = '/test/project'
    generateOxlint({ plugins: [], cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, '.oxlintrc.json'))

    const config = JSON.parse(content as string)
    expect(config.$schema).toBe('./node_modules/oxlint/configuration_schema.json')
    expect(config.plugins).toBeUndefined()
    expect(config.rules['no-unused-vars']).toBe('warn')
  })

  it('oxlint config with plugins', () => {
    /*
      Flow:
      1. Call generateOxlint with plugins ['react', 'typescript']
      2. Verify plugins array is included in config
    */
    const cwd = '/test/project'
    generateOxlint({ plugins: ['react', 'typescript'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config.plugins).toEqual(['react', 'typescript'])
  })
})
