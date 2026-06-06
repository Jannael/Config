import type { Formatters } from '@/configs/types'
import Print from '@/utils/print'
import { Select } from '@/utils/select'
import configs from 'configs'

export class GetFormatterUseCase {
  private async GetCommonFormatters(selectedConfigs: string[]): Promise<string[]> {
    const allFormatterSets = selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      return new Set(Object.keys(config?.formatter ?? {}))
    })
    const commonFormatters = allFormatterSets.reduce((acc, set) => {
      return new Set([...acc].filter((formatter) => set.has(formatter)))
    }, allFormatterSets[0] || new Set<string>())

    return [...commonFormatters]
  }

  public async execute(selectedConfigs: string[]): Promise<Formatters> {
    const commonFormatters = await this.GetCommonFormatters(selectedConfigs)
    let formatter: string = commonFormatters.length === 1 ? commonFormatters[0]! : ''

    if (commonFormatters.length === 0) {
      Print.error('No common formatters found for the selected technologies.')
      process.exit(1)
    }

    if (commonFormatters.length > 1) {
      formatter = await Select({
        message: 'Select your formatter:',
        options: commonFormatters.map((formatter) => {
          return {
            value: formatter,
            label: formatter,
          }
        }),
      })
    }

    return formatter as Formatters
  }
}
