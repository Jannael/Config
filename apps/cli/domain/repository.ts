export interface Repository {
  installDependencies({ dependencies }: { dependencies: string[] }): Promise<void>
  getPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'>
  writeBiomeConfig(tech: string): Promise<void>
  writePrettierConfig(tech: string): Promise<void>
  writeEslintConfig(tech: string): Promise<void>
  writeOxLintConfig(tech: string): Promise<void>
  writeOxFmtConfig(tech: string): Promise<void>
}
