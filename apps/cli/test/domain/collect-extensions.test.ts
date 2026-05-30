import { describe, it, expect } from 'vitest'
import { collectExtensions } from '@/domain/resolver'

describe('collectExtensions', () => {
  it('react extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['react']
      2. Verify result contains jsx and tsx
    */
    const result = collectExtensions(['react'])

    expect(result).toContain('jsx')
    expect(result).toContain('tsx')
  })

  it('vue extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['vue']
      2. Verify result contains vue
    */
    const result = collectExtensions(['vue'])

    expect(result).toContain('vue')
  })

  it('multiple technologies merge extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['react', 'typescript']
      2. Verify result contains jsx, tsx from react and ts from typescript
      3. Verify no duplicates in result
    */
    const result = collectExtensions(['react', 'typescript'])

    expect(result).toContain('jsx')
    expect(result).toContain('tsx')
    expect(result).toContain('ts')
    expect(result.length).toBe(new Set(result).size)
  })

  it('angular extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['angular']
      2. Verify result contains ts and html
    */
    const result = collectExtensions(['angular'])

    expect(result).toContain('ts')
    expect(result).toContain('html')
  })

  it('svelte extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['svelte']
      2. Verify result contains svelte
    */
    const result = collectExtensions(['svelte'])

    expect(result).toContain('svelte')
  })

  it('astro extensions', () => {
    /*
      Flow:
      1. Call collectExtensions with ['astro']
      2. Verify result contains astro
    */
    const result = collectExtensions(['astro'])

    expect(result).toContain('astro')
  })

  it('unknown technology returns empty array', () => {
    /*
      Flow:
      1. Call collectExtensions with ['unknown-tech']
      2. Verify result is empty
    */
    const result = collectExtensions(['unknown-tech'])

    expect(result).toEqual([])
  })

  it('result is sorted alphabetically', () => {
    /*
      Flow:
      1. Call collectExtensions with multiple technologies
      2. Verify result is sorted
    */
    const result = collectExtensions(['react', 'vue', 'angular'])

    const sorted = [...result].sort()
    expect(result).toEqual(sorted)
  })
})
