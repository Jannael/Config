export interface LinterConfig {
	linter: {
		eslint?: {
			plugins?: string[]
			config?: {
				importStatements: string[]
				configSpread: string[]
				configObject: string[]
				ignorePatterns: string[]
				fileExtensions: string[]
			}
		}
		oxlint?: {
			plugins?: string[]
		}
		biome?: object
	}
}

export interface FormatterConfig {
	formatter: {
		prettier?: {
			plugins?: string[]
		}
		biome?: object
		oxfmt?: object
	}
}

export type Linters = 'eslint' | 'oxlint' | 'biome'
export type Formatters = 'prettier' | 'oxfmt' | 'biome'
