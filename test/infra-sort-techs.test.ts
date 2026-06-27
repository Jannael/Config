import { test, expect, describe } from 'bun:test'

import { Repository } from '@/infra/infra'

const sortTechs = (input: string[]): string[] => {
	const repo = new Repository()
	return (repo as unknown as { sortTechs: (t: string[]) => string[] }).sortTechs(input)
}

const collectEslintConfig = (
	input: string[],
): {
	importStatements: string[]
	configSpread: string[]
	ignorePatterns: string[]
	fileExtensions: string[]
} => {
	const repo = new Repository()
	return (
		repo as unknown as {
			collectEslintConfig: (t: string[]) => {
				importStatements: string[]
				configSpread: string[]
				ignorePatterns: string[]
				fileExtensions: string[]
			}
		}
	).collectEslintConfig(input)
}

describe('Repository.sortTechs (eslint parser order)', () => {
	test('places typescript before astro so the astro parser wins (the bug that motivated this method)', () => {
		expect(sortTechs(['astro', 'typescript'])).toEqual(['typescript', 'astro'])
	})

	test('places typescript before vue so the vue parser wins', () => {
		expect(sortTechs(['vue', 'typescript'])).toEqual(['typescript', 'vue'])
	})

	test('puts known base techs first (javascript, typescript) in their declared order', () => {
		expect(sortTechs(['react', 'typescript', 'javascript'])).toEqual(['javascript', 'typescript', 'react'])
	})

	test('preserves relative order among unknown techs (pushed to the end)', () => {
		expect(sortTechs(['react', 'astro', 'vue'])).toEqual(['react', 'astro', 'vue'])
	})

	test('mixes known and unknown techs correctly: known first in declared order, then unknown in input order', () => {
		expect(sortTechs(['astro', 'react', 'typescript', 'html'])).toEqual(['typescript', 'html', 'astro', 'react'])
	})

	test('does not mutate the input array', () => {
		const input = ['astro', 'typescript']
		sortTechs(input)
		expect(input).toEqual(['astro', 'typescript'])
	})

	test('returns an empty array for empty input', () => {
		expect(sortTechs([])).toEqual([])
	})

	test('returns the same single element for single-element input', () => {
		expect(sortTechs(['react'])).toEqual(['react'])
	})

	test('handles tailwind and html in declared order, with framework techs after', () => {
		expect(sortTechs(['react', 'tailwind', 'html', 'typescript'])).toEqual(['typescript', 'html', 'tailwind', 'react'])
	})
})

describe('Repository.collectEslintConfig (integration: order propagates to imports/spreads)', () => {
	test('astro parser/import comes AFTER typescript in importStatements and configSpread', () => {
		const cfg = collectEslintConfig(['astro', 'typescript'])
		const tsImportIdx = cfg.importStatements.indexOf("import typescriptEslint from 'typescript-eslint'")
		const astroImportIdx = cfg.importStatements.indexOf("import eslintPluginAstro from 'eslint-plugin-astro'")
		const tsSpreadIdx = cfg.configSpread.indexOf('...typescriptEslint.configs.recommended,')
		const astroSpreadIdx = cfg.configSpread.indexOf('...eslintPluginAstro.configs.recommended,')

		expect(tsImportIdx).toBeGreaterThanOrEqual(0)
		expect(astroImportIdx).toBeGreaterThan(tsImportIdx)
		expect(tsSpreadIdx).toBeGreaterThanOrEqual(0)
		expect(astroSpreadIdx).toBeGreaterThan(tsSpreadIdx)
	})

	test('vue import comes AFTER typescript in importStatements', () => {
		const cfg = collectEslintConfig(['vue', 'typescript'])
		const tsImportIdx = cfg.importStatements.indexOf("import typescriptEslint from 'typescript-eslint'")
		const vueImportIdx = cfg.importStatements.indexOf("import eslintPluginVue from 'eslint-plugin-vue'")

		expect(tsImportIdx).toBeGreaterThanOrEqual(0)
		expect(vueImportIdx).toBeGreaterThan(tsImportIdx)
	})

	test('input order does not affect output — reversing input still produces the same sorted result', () => {
		const a = collectEslintConfig(['astro', 'typescript'])
		const b = collectEslintConfig(['typescript', 'astro'])
		expect(a.importStatements).toEqual(b.importStatements)
		expect(a.configSpread).toEqual(b.configSpread)
		expect(a.fileExtensions).toEqual(b.fileExtensions)
	})

	test('deduplicates import statements when the same plugin appears in multiple techs', () => {
		const cfg = collectEslintConfig(['typescript', 'react'])
		const tsImports = cfg.importStatements.filter((s) => s === "import typescriptEslint from 'typescript-eslint'")
		expect(tsImports).toHaveLength(1)
	})

	test('merges file extensions from every selected tech', () => {
		const cfg = collectEslintConfig(['typescript', 'astro'])
		expect(cfg.fileExtensions).toContain('.ts')
		expect(cfg.fileExtensions).toContain('.tsx')
		expect(cfg.fileExtensions).toContain('.astro')
	})
})
