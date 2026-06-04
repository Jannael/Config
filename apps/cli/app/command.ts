import type { Repository } from '@/domain/repository'
import configs from 'configs'
import { MultiSelect } from '@/utils/multiselect'
import { Select } from '@/utils/select'

import Print from 'print'

export class Command {
  constructor(private readonly repository: Repository) {}

  async execute(): Promise<void> {
    // const packageManager = await this.repository.getPackageManager()
    const selectedConfigs = await MultiSelect({
      message: 'Select your technologies:',
      options: Object.keys(configs.techs).map((key) => ({
        value: key,
        label: configs.techs[key as keyof typeof configs.techs].label,
      })),
    })
    const formatter = await this.GetFormatter(selectedConfigs)
    const linter = await this.GetLinter(selectedConfigs)

    Print.trace(`Selected technologies: ${selectedConfigs.join(', ')}`)
    Print.trace(`Selected formatter: ${formatter}`)
    Print.trace(`Selected linter: ${linter}`)
  }

  private async GetCommonLinters(selectedConfigs: string[]): Promise<string[]> {
    const allLinterSets = selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      return new Set(Object.keys(config.linter))
    })

    const commonLinters = allLinterSets.reduce((acc, set) => {
      return new Set([...acc].filter((linter) => set.has(linter)))
    }, allLinterSets[0] || new Set<string>())

    return [...commonLinters]
  }

  private async GetCommonFormatters(selectedConfigs: string[]): Promise<string[]> {
    const allFormatterSets = selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      return new Set(Object.keys(config.formatter))
    })
    const commonFormatters = allFormatterSets.reduce((acc, set) => {
      return new Set([...acc].filter((formatter) => set.has(formatter)))
    }, allFormatterSets[0] || new Set<string>())

    return [...commonFormatters]
  }

  private async GetFormatter(selectedConfigs: string[]): Promise<string> {
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

    return formatter
  }

  private async GetLinter(selectedConfigs: string[]): Promise<string> {
    const commonLinters = await this.GetCommonLinters(selectedConfigs)
    let linter: string = commonLinters.length === 1 ? commonLinters[0]! : ''

    if (commonLinters.length === 0) {
      Print.error('No common linters found for the selected technologies.')
      process.exit(1)
    }

    if (commonLinters.length > 1) {
      linter = await Select({
        message: 'Select your linter:',
        options: commonLinters.map((linter) => {
          return {
            value: linter,
            label: linter,
          }
        }),
      })
    }
    return linter
  }
}
