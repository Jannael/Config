import js from '@eslint/js'
import typescriptEslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'

export default [
	{ ignores: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/.astro/**'] },
	js.configs.recommended,
	...typescriptEslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{ files: ['**/*.ts', '**/*.tsx'], languageOptions: { parser: typescriptEslint.parser } },
	{ files: ['**/*.astro'], languageOptions: { parserOptions: { parser: '@typescript-eslint/parser' } } },
	{ files: ['*.ts', '*.tsx', '*.astro'] },
]
