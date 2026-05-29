export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn'

export type TechConfig = {
  linter: Record<string, { plugins?: string[] }>
  formatter: Record<string, { plugins?: string[] }>
}

export type ResolveResult = {
  linters: string[]
  formatters: string[]
}

export type CollectedPlugins = {
  linterPlugins: string[]
  formatterPlugins: string[]
  oxlintPlugins: string[]
}
