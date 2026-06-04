export interface Repository {
  installDependencies({ dependencies }: { dependencies: string[] }): Promise<void>
  getPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'>
}
