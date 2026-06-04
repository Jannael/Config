export interface DataType {
  label: string
  linter: {
    eslint: {
      commands: {
        lint: string,
        "lint:fix": string
      },
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
  formatter: {
    prettier: {
      commands: {
        fmt: string,
        "fmt:check": string
      },
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
