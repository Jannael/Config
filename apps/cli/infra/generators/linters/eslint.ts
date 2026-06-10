import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateEslint({
	importStatements,
	configSpread,
	ignorePatterns,
	fileExtensions,
	cwd,
}: {
	importStatements: string[]
	configSpread: string[]
	ignorePatterns: string[]
	fileExtensions: string[]
	cwd: string
}): void {
	const imports = [`import js from "@eslint/js"`, ...importStatements]

	const entries: string[] = []

	if (ignorePatterns.length > 0) {
		entries.push(`    { ignores: ${JSON.stringify(ignorePatterns)} },`)
	}

	entries.push(`    js.configs.recommended,`)

	for (const spread of configSpread) {
		entries.push(`    ${spread}`)
	}

	if (fileExtensions.length > 0) {
		const exts = fileExtensions.map((e) => `'*${e}'`).join(', ')
		entries.push(`    { files: [${exts}] },`)
	}

	const content = `${imports.join('\n')}

export default [
${entries.join('\n')}
]
`

	writeFileSync(join(cwd, 'eslint.config.js'), content)
}
