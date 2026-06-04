import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateEslint({ plugins, cwd }: { plugins: string[]; cwd: string }): void {
  console.log(plugins)
  const imports: string[] = [`import js from "@eslint/js"`]
  const configEntries: string[] = [
    `    { ignores: ["**/dist/**", "**/node_modules/**", "**/build/**", "**/.astro/**"] },`,
    `    js.configs.recommended,`,
  ]

  const content = `${imports.join('\n')}

export default [
${configEntries.join('\n')}
]
`

  writeFileSync(join(cwd, 'eslint.config.js'), content)
}
