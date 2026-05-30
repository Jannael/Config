import js from "@eslint/js"
import tsEslint from "typescript-eslint"
import astroParser from "astro-eslint-parser"
import astro from "eslint-plugin-astro"
import tailwind from "eslint-plugin-tailwindcss"

export default [
    { ignores: ["dist/**", "apps/web/dist/**"] },
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    {
      files: ["**/*.astro"],
      languageOptions: { parser: astroParser },
    },
    ...astro.configs.recommended,
    {
      files: ["apps/web/**/*.{js,jsx,ts,tsx,astro}"],
      plugins: { tailwindcss: tailwind },
      rules: { ...tailwind.configs.recommended.rules },
    },
    {
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },
]
