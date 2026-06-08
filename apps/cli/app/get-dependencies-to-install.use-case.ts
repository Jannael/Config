import type { Formatters, Linters } from '@/configs/types'
import configs from 'configs'

const MAIN_PACKAGES: Record<string, string> = {
  eslint: 'eslint',
  oxlint: 'oxlint',
  biome: '@biomejs/biome',
  prettier: 'prettier',
  oxfmt: 'oxfmt',
}

export class GetDependenciesToInstallUseCase {
  public async execute(
    formatter: Formatters,
    linter: Linters,
    selectedConfigs: string[],
  ): Promise<string[]> {
    const dependenciesToInstall = new Set<string>()

    dependenciesToInstall.add(MAIN_PACKAGES[linter]!)
    if (formatter !== linter) {
      dependenciesToInstall.add(MAIN_PACKAGES[formatter]!)
    }

    selectedConfigs.map((tech) => {
      const config = configs.techs[tech as keyof typeof configs.techs]
      const formatterConfig = config?.formatter[formatter] as { plugins?: string[] }
      const linterConfig = config?.linter[linter] as { plugins?: string[] }

      if (formatter === 'prettier' && formatterConfig?.plugins) {
        formatterConfig.plugins.forEach((p) => dependenciesToInstall.add(p))
      }

      if (linter === 'eslint' && linterConfig?.plugins) {
        linterConfig.plugins.forEach((p) => dependenciesToInstall.add(p))
      }
    })

    return [...dependenciesToInstall]
  }
}
