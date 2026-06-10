export interface LinterConfig {
	linter: {
		eslint?: {
			plugins?: string[]
			config?: {
				importStatements: string[]
				configSpread: string[]
				ignorePatterns: string[]
				fileExtensions: string[]
			}
		}
		oxlint?: {
			plugins?: string[]
		}
		biome?: {}
	}
}

export interface FormatterConfig {
	formatter: {
		prettier?: {
			plugins?: string[]
		}
		biome?: {}
		oxfmt?: {}
	}
}

export type Linters = 'eslint' | 'oxlint' | 'biome'
export type Formatters = 'prettier' | 'oxfmt' | 'biome'
