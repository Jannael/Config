export interface LinterConfig {
  linter: {
    eslint: {
      plugins: string[]
      config: {
        importStatements: string[]
        configSpread: string[]
        ignorePatterns: string[]
        fileExtensions: string[]
      }
    }
    oxlint: {
      plugins: string[]
    }
  }
}

export interface FormatterConfig {
  formatter: {
    prettier: {
      config: {
        path: string
        importStatement: string
        configSpread: {
          plugins: string[]
        }
      }
    }
  }
}
