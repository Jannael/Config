export interface LinterConfig  {
  label: string
  linter: {
    eslint: {
      plugins: string[]
      config: {
        path: string,
        importStatement: string,
        configSpread: string[],
        ignorePatterns: string[],
        fileExtensions: string[],
      }
    }
  },
}

export interface FormatterConfig {
  formatter: {
    prettier: {
      config: {
        path: string,
        importStatement: string,
        configSpread: {
          plugins: string[]
        }
      }
    }
  }
}
