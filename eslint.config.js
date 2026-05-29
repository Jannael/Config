import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import tailwindcss from 'eslint-plugin-tailwindcss'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...tailwindcss.configs['flat/recommended'],
  {
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
    },
    settings: {
      tailwindcss: {
        config: {
          content: [],
          theme: { extend: {} },
          plugins: [],
        },
      },
    },
  },
]
