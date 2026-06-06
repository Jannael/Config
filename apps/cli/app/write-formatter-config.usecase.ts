import type { Formatters } from '@/configs/types'
import type { Repository } from '@/domain/repository'

export class WriteFormatterConfigUseCase {
  constructor(private repository: Repository) {}

  public async execute(formatter: Formatters, techs: string[]): Promise<void> {
    if (formatter === 'prettier') {
      await this.repository.writePrettierConfig(techs)
    } else if (formatter === 'oxfmt') {
      await this.repository.writeOxFmtConfig(techs)
    } else if (formatter === 'biome') {
      await this.repository.writeBiomeConfig(techs)
    }
  }
}
