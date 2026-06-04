import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

type PluginMeta = {
  importStatement: string
  configSpread: string
}

const pluginMeta: Record<string, PluginMeta> = {
  'eslint-plugin-html': {
    importStatement: `import html from "eslint-plugin-html"`,
    configSpread: `    {
      files: ["**/*.html"],
      plugins: { html },
    },`,
  },
  'eslint-plugin-react': {
    importStatement: `import react from "eslint-plugin-react"`,
    configSpread: `    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: { react },
      settings: { react: { version: "detect" } },
      rules: { ...react.configs.recommended.rules },
    },`,
  },
  'eslint-plugin-react-hooks': {
    importStatement: `import reactHooks from "eslint-plugin-react-hooks"`,
    configSpread: `    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: { "react-hooks": reactHooks },
      rules: { ...reactHooks.configs.recommended.rules },
    },`,
  },
  'eslint-config-next': {
    importStatement: `import next from "eslint-config-next/flat.js"`,
    configSpread: `    ...next,`,
  },
  'eslint-plugin-solid': {
    importStatement: `import solid from "eslint-plugin-solid/configs/typescript.js"`,
    configSpread: `    solid,`,
  },
  '@react-native/eslint-config': {
    importStatement: `import reactNative from "@react-native/eslint-config"`,
    configSpread: `    ...reactNative,`,
  },
  'eslint-plugin-vue': {
    importStatement: `import pluginVue from "eslint-plugin-vue"`,
    configSpread: `    ...pluginVue.configs["flat/recommended"],`,
  },
  'vue-eslint-parser': {
    importStatement: `import vueParser from "vue-eslint-parser"`,
    configSpread: `    {
      files: ["**/*.vue"],
      languageOptions: { parser: vueParser },
    },`,
  },
  '@typescript-eslint/parser': {
    importStatement: `import tsParser from "@typescript-eslint/parser"`,
    configSpread: `    {
      languageOptions: { parser: tsParser },
    },`,
  },
  'eslint-plugin-lit': {
    importStatement: `import lit from "eslint-plugin-lit"`,
    configSpread: `    {
      plugins: { lit },
      rules: { ...lit.configs.recommended.rules },
    },`,
  },
  'eslint-plugin-wc': {
    importStatement: `import wc from "eslint-plugin-wc"`,
    configSpread: `    {
      plugins: { wc },
      rules: { ...wc.configs.recommended.rules },
    },`,
  },
  'eslint-plugin-tailwindcss': {
    importStatement: `import tailwind from "eslint-plugin-tailwindcss"`,
    configSpread: `    {
      files: ["**/*.{js,jsx,ts,tsx,astro,html,vue}"],
      plugins: { tailwindcss: tailwind },
      rules: { ...tailwind.configs.recommended.rules },
      settings: {
        tailwindcss: {
          config: {},
        },
      },
    },`,
  },
  'typescript-eslint': {
    importStatement: `import tsEslint from "typescript-eslint"`,
    configSpread: `    ...tsEslint.configs.recommended,`,
  },
}

export function generateEslint({
  plugins: linterPlugins,
  cwd,
}: {
  plugins: string[]
  cwd: string
}): void {
  const imports: string[] = [`import js from "@eslint/js"`]
  const configEntries: string[] = [
    `    { ignores: ["**/dist/**", "**/node_modules/**", "**/build/**", "**/.astro/**"] },`,
    `    js.configs.recommended,`,
  ]

  const seenImports = new Set<string>()

  for (const plugin of linterPlugins) {
    const meta = pluginMeta[plugin]
    if (!meta || !meta.importStatement) continue

    if (!seenImports.has(meta.importStatement)) {
      imports.push(meta.importStatement)
      seenImports.add(meta.importStatement)
    }

    if (meta.configSpread) configEntries.push(meta.configSpread)
  }

  if (linterPlugins.includes('typescript-eslint')) {
    configEntries.push(`    {
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },`)
  }

  const content = `${imports.join('\n')}

export default [
${configEntries.join('\n')}
]
`

  writeFileSync(join(cwd, 'eslint.config.js'), content)
}
