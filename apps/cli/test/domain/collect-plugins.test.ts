import { describe, it, expect } from 'vitest'
import { collectPlugins } from '@/domain/resolver'

describe('collectPlugins', () => {
  it('react eslint plugins', () => {
    /*
      Flow:
      1. Call collectPlugins with ['react'] and 'eslint' as linter
      2. Verify linterPlugins contains eslint-plugin-react and eslint-plugin-react-hooks
      3. Verify formatterPlugins is empty
    */
    const result = collectPlugins(['react'], 'eslint', 'prettier')

    expect(result.linterPlugins).toContain('eslint-plugin-react')
    expect(result.linterPlugins).toContain('eslint-plugin-react-hooks')
    expect(result.formatterPlugins).toEqual([])
  })

  it('react oxlint plugins', () => {
    /*
      Flow:
      1. Call collectPlugins with ['react'] and 'oxlint' as linter
      2. Verify oxlintPlugins contains 'react'
    */
    const result = collectPlugins(['react'], 'oxlint', 'oxfmt')

    expect(result.oxlintPlugins).toContain('react')
  })

  it('multiple technologies merge plugins', () => {
    /*
      Flow:
      1. Call collectPlugins with ['react', 'typescript'] and 'eslint'
      2. Verify linterPlugins contains react plugins and typescript-eslint plugins
      3. Verify no duplicates in result
    */
    const result = collectPlugins(['react', 'typescript'], 'eslint', 'prettier')

    expect(result.linterPlugins).toContain('eslint-plugin-react')
    expect(result.linterPlugins).toContain('typescript-eslint')
    expect(result.linterPlugins.length).toBe(new Set(result.linterPlugins).size)
  })

  it('tailwind prettier plugin', () => {
    /*
      Flow:
      1. Call collectPlugins with ['tailwind'] and 'prettier' as formatter
      2. Verify formatterPlugins contains prettier-plugin-tailwindcss
    */
    const result = collectPlugins(['tailwind'], 'eslint', 'prettier')

    expect(result.formatterPlugins).toContain('prettier-plugin-tailwindcss')
  })

  it('unknown technology returns empty plugins', () => {
    /*
      Flow:
      1. Call collectPlugins with ['unknown-tech']
      2. Verify all plugin arrays are empty
    */
    const result = collectPlugins(['unknown-tech'], 'eslint', 'prettier')

    expect(result.linterPlugins).toEqual([])
    expect(result.formatterPlugins).toEqual([])
    expect(result.oxlintPlugins).toEqual([])
  })

  it('biome has no plugins', () => {
    /*
      Flow:
      1. Call collectPlugins with ['react'] and 'biome' as linter
      2. Verify linterPlugins is empty (biome has no external plugins)
    */
    const result = collectPlugins(['react'], 'biome', 'biome')

    expect(result.linterPlugins).toEqual([])
  })
})
