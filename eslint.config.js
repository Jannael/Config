import js from '@eslint/js'
import tsEslint from 'typescript-eslint'
import astroParser from 'astro-eslint-parser'
import astro from 'eslint-plugin-astro'
import tailwind from 'eslint-plugin-tailwindcss'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'build/**', 'apps/web/.astro/**', 'apps/web/dist/**'] },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: { parser: astroParser },
  },
  ...astro.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,astro,html,vue,svelte}'],
    plugins: { tailwindcss: tailwind },
    rules: {
      ...tailwind.configs.recommended.rules,
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/classnames-order': 'off',
    },
    settings: {
      tailwindcss: {
        config: {},
      },
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    },
  },
]
