import js from '@eslint/js'
import typescriptEslint from 'typescript-eslint'
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss'
import eslintPluginAstro from 'eslint-plugin-astro'

export default [
	{ ignores: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/.astro/**'] },
	js.configs.recommended,
	...typescriptEslint.configs.recommended,
	...eslintPluginTailwindcss.configs['flat/recommended'],
	{ settings: { tailwindcss: { config: {} } } },
	{
		rules: {
			'tailwindcss/no-custom-classname': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
		},
	},
	...eslintPluginAstro.configs.recommended,
	{ files: ['*.ts', '*.tsx', '*.astro'] },
]
