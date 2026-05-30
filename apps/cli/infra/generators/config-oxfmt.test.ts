import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generateOxfmt } from '@/infra/generators/oxfmt'

describe('generateOxfmt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('oxfmt config', () => {
    /*
      Flow:
      1. Call generateOxfmt with cwd
      2. Verify writeFileSync called with .oxfmtrc.json path
      3. Verify config contains formatting settings
    */
    const cwd = '/test/project'
    generateOxfmt({ cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, '.oxfmtrc.json'))

    const config = JSON.parse(content as string)
    expect(config.$schema).toBe('./node_modules/oxfmt/configuration_schema.json')
    expect(config.lineWidth).toBe(100)
    expect(config.indentStyle).toBe('space')
    expect(config.indentWidth).toBe(2)
    expect(config.semicolons).toBe(false)
    expect(config.quoteStyle).toBe('single')
  })
})
