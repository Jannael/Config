import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generatePrettier } from '@/infra/generators/prettier'

describe('generatePrettier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prettier config without plugins', () => {
    /*
      Flow:
      1. Call generatePrettier with empty plugins array
      2. Verify writeFileSync called with .prettierrc path
      3. Verify config contains base settings and no plugins field
    */
    const cwd = '/test/project'
    generatePrettier({ plugins: [], cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, '.prettierrc'))

    const config = JSON.parse(content as string)
    expect(config.semi).toBe(false)
    expect(config.singleQuote).toBe(true)
    expect(config.printWidth).toBe(100)
    expect(config.plugins).toBeUndefined()
  })

  it('prettier config with plugins', () => {
    /*
      Flow:
      1. Call generatePrettier with plugins ['prettier-plugin-tailwindcss']
      2. Verify plugins array is included in config
    */
    const cwd = '/test/project'
    generatePrettier({ plugins: ['prettier-plugin-tailwindcss'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const config = JSON.parse(content as string)

    expect(config.plugins).toEqual(['prettier-plugin-tailwindcss'])
  })
})
