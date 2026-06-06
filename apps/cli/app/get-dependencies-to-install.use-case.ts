import type { Formatters, Linters } from '@/configs/types'
import configs from 'configs'

export class GetDependenciesToInstallUseCase {
  public async execute(
    formatter: Formatters,
    linter: Linters,
    selectedConfigs: string[],
  ): Promise<string[]> {
    const dependenciesToInstall: string[] = []

    selectedConfigs.map((tech) => {
      // eslint and prettier are the only that can have plugins that need to be installed
      const config = configs.techs[tech as keyof typeof configs.techs]
      const formatterConfig = config?.formatter[formatter] as { plugins?: string[] }
      const linterConfig = config?.linter[linter] as { plugins?: string[] }

      if (formatter === 'prettier' && formatterConfig?.plugins) {
        dependenciesToInstall.push(...formatterConfig.plugins)
      }

      if (linter === 'eslint' && linterConfig?.plugins) {
        dependenciesToInstall.push(...linterConfig.plugins)
      }
    })

    return dependenciesToInstall
  }
}
