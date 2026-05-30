import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generateBiome } from '@/infra/generators/biome'

describe('generateBiome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('biome config', () => {
    /*
      Flow:
      1. Call generateBiome with cwd
      2. Verify writeFileSync called with biome.json path
      3. Verify config contains formatter, linter, and javascript settings
    */
    const cwd = '/test/project'
    generateBiome({ cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, 'biome.json'))

    const config = JSON.parse(content as string)
    expect(config.$schema).toBe('https://biomejs.dev/schemas/2.0.0/schema.json')
    expect(config.formatter.enabled).toBe(true)
    expect(config.formatter.lineWidth).toBe(100)
    expect(config.formatter.indentStyle).toBe('space')
    expect(config.formatter.indentWidth).toBe(2)
    expect(config.javascript.formatter.semicolons).toBe('asNeeded')
    expect(config.javascript.formatter.quoteStyle).toBe('single')
    expect(config.linter.enabled).toBe(true)
    expect(config.linter.rules.recommended).toBe(true)
  })
})
