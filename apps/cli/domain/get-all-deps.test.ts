import { describe, it, expect } from 'vitest'
import { getAllDeps } from '@/domain/resolver'

describe('getAllDeps', () => {
  it('eslint base dependencies', () => {
    /*
      Flow:
      1. Call getAllDeps with 'eslint' as linter
      2. Verify result contains eslint and @eslint/js
    */
    const result = getAllDeps('eslint', 'prettier', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('eslint')
    expect(result).toContain('@eslint/js')
  })

  it('oxlint base dependency', () => {
    /*
      Flow:
      1. Call getAllDeps with 'oxlint' as linter
      2. Verify result contains oxlint
    */
    const result = getAllDeps('oxlint', 'oxfmt', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('oxlint')
  })

  it('biome base dependency', () => {
    /*
      Flow:
      1. Call getAllDeps with 'biome' as linter and formatter
      2. Verify result contains @biomejs/biome only once
    */
    const result = getAllDeps('biome', 'biome', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('@biomejs/biome')
    expect(result.filter((d) => d === '@biomejs/biome').length).toBe(1)
  })

  it('prettier dependency', () => {
    /*
      Flow:
      1. Call getAllDeps with 'prettier' as formatter
      2. Verify result contains prettier
    */
    const result = getAllDeps('eslint', 'prettier', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('prettier')
  })

  it('oxfmt dependency', () => {
    /*
      Flow:
      1. Call getAllDeps with 'oxfmt' as formatter
      2. Verify result contains oxfmt
    */
    const result = getAllDeps('oxlint', 'oxfmt', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('oxfmt')
  })

  it('linter plugins added to dependencies', () => {
    /*
      Flow:
      1. Call getAllDeps with linterPlugins containing eslint-plugin-react
      2. Verify eslint-plugin-react is in result
    */
    const result = getAllDeps('eslint', 'prettier', {
      linterPlugins: ['eslint-plugin-react'],
      formatterPlugins: [],
      oxlintPlugins: [],
    })

    expect(result).toContain('eslint-plugin-react')
  })

  it('formatter plugins added to dependencies', () => {
    /*
      Flow:
      1. Call getAllDeps with formatterPlugins containing prettier-plugin-tailwindcss
      2. Verify prettier-plugin-tailwindcss is in result
    */
    const result = getAllDeps('eslint', 'prettier', {
      linterPlugins: [],
      formatterPlugins: ['prettier-plugin-tailwindcss'],
      oxlintPlugins: [],
    })

    expect(result).toContain('prettier-plugin-tailwindcss')
  })

  it('oxlint plugins not added to dependencies', () => {
    /*
      Flow:
      1. Call getAllDeps with oxlintPlugins containing 'react'
      2. Verify 'react' is NOT in result (oxlint plugins are built-in)
    */
    const result = getAllDeps('oxlint', 'oxfmt', {
      linterPlugins: [],
      formatterPlugins: [],
      oxlintPlugins: ['react'],
    })

    expect(result).not.toContain('react')
  })

  it('result is sorted alphabetically', () => {
    /*
      Flow:
      1. Call getAllDeps with multiple plugins
      2. Verify result is sorted
    */
    const result = getAllDeps('eslint', 'prettier', {
      linterPlugins: ['z-plugin', 'a-plugin'],
      formatterPlugins: ['m-plugin'],
      oxlintPlugins: [],
    })

    const sorted = [...result].sort()
    expect(result).toEqual(sorted)
  })
})
