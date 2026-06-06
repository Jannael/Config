import type { Linters } from '@/configs/types'
import type { Repository } from '@/domain/repository'

export class WriteLinterConfigUseCase {
  constructor(private readonly repository: Repository) {}

  public async execute(linter: Linters, techs: string[]): Promise<void> {
    if (linter === 'eslint') {
      await this.repository.writeEslintConfig(techs)
    } else if (linter === 'oxlint') {
      await this.repository.writeOxLintConfig(techs)
    } else if (linter === 'biome') {
      await this.repository.writeBiomeConfig(techs)
    }
  }
}
