import { test, expect, describe } from 'bun:test'

import { GetDependenciesToInstallUseCase } from '@/app/get-dependencies-to-install.use-case'

describe('GetDependenciesToInstallUseCase', () => {
  const useCase = new GetDependenciesToInstallUseCase()

  test('includes the main linter and formatter packages for eslint + prettier on typescript', async () => {
    const deps = await useCase.execute('prettier', 'eslint', ['typescript'])
    expect(deps).toContain('eslint')
    expect(deps).toContain('@eslint/js')
    expect(deps).toContain('prettier')
  })

  test('includes the eslint and prettier plugins declared by each selected tech', async () => {
    const deps = await useCase.execute('prettier', 'eslint', ['typescript', 'tailwind'])
    expect(deps).toContain('typescript-eslint')
    expect(deps).toContain('eslint-plugin-tailwindcss')
    expect(deps).toContain('prettier-plugin-tailwindcss')
  })

  test('does not include formatter packages when formatter and linter are the same (biome)', async () => {
    const deps = await useCase.execute('biome', 'biome', ['typescript'])
    expect(deps).toContain('@biomejs/biome')
    expect(deps).toHaveLength(1)
  })

  test('includes biome once (not duplicated) when biome handles both linter and formatter', async () => {
    const deps = await useCase.execute('biome', 'biome', ['react', 'next'])
    const biomeOccurrences = deps.filter((d) => d === '@biomejs/biome').length
    expect(biomeOccurrences).toBe(1)
  })

  test('adds prettier plugins only when formatter is prettier', async () => {
    const prettierDeps = await useCase.execute('prettier', 'eslint', ['tailwind'])
    expect(prettierDeps).toContain('prettier-plugin-tailwindcss')

    const oxfmtDeps = await useCase.execute('oxfmt', 'eslint', ['tailwind'])
    expect(oxfmtDeps).not.toContain('prettier-plugin-tailwindcss')
  })

  test('adds eslint plugins only when linter is eslint', async () => {
    const eslintDeps = await useCase.execute('prettier', 'eslint', ['typescript', 'tailwind'])
    expect(eslintDeps).toContain('typescript-eslint')
    expect(eslintDeps).toContain('eslint-plugin-tailwindcss')

    const oxlintDeps = await useCase.execute('prettier', 'oxlint', ['typescript', 'tailwind'])
    expect(oxlintDeps).not.toContain('typescript-eslint')
    expect(oxlintDeps).not.toContain('eslint-plugin-tailwindcss')
    expect(oxlintDeps).toContain('oxlint')
  })

  test('deduplicates dependencies when multiple techs declare the same plugin', async () => {
    const deps = await useCase.execute('prettier', 'eslint', ['typescript', 'next'])
    const typescriptEslintCount = deps.filter((d) => d === 'typescript-eslint').length
    expect(typescriptEslintCount).toBe(1)
  })

  test('ignores plugins declared for a tool other than the active linter/formatter', async () => {
    const deps = await useCase.execute('prettier', 'eslint', ['react'])
    expect(deps).not.toContain('react')
    expect(deps).not.toContain('nextjs')
  })

  test('returns main packages only for a tech with no declared plugins', async () => {
    const deps = await useCase.execute('prettier', 'eslint', ['javascript'])
    expect(deps.sort()).toEqual(['@eslint/js', 'eslint', 'prettier'].sort())
  })

  test('handles an empty selection returning only main packages', async () => {
    const deps = await useCase.execute('prettier', 'eslint', [])
    expect(deps.sort()).toEqual(['@eslint/js', 'eslint', 'prettier'].sort())
  })
})
