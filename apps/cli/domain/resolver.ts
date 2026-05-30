import { dataMap } from '
import type { ResolveResult, CollectedPlugins } from '@/domain/types'

export function resolve(techs: string[]): ResolveResult {
  const configs = techs.map((t) => dataMap[t]).filter(Boolean)

  if (configs.length === 0) {
    return { linters: [], formatters: [] }
  }

  let linterSet = new Set(Object.keys(configs[0]!.linter))
  let formatterSet = new Set(Object.keys(configs[0]!.formatter))

  for (let i = 1; i < configs.length; i++) {
    const config = configs[i]!
    linterSet = new Set([...linterSet].filter((l) => l in config.linter))
    formatterSet = new Set([...formatterSet].filter((f) => f in config.formatter))
  }

  return {
    linters: [...linterSet].sort(),
    formatters: [...formatterSet].sort(),
  }
}

export function collectPlugins(
  techs: string[],
  linter: string,
  formatter: string,
): CollectedPlugins {
  const linterPlugins = new Set<string>()
  const formatterPlugins = new Set<string>()
  const oxlintPlugins = new Set<string>()

  for (const tech of techs) {
    const config = dataMap[tech]
    if (!config) continue

    const linterConfig = config.linter[linter]
    if (linterConfig?.plugins) {
      for (const p of linterConfig.plugins) {
        linterPlugins.add(p)
      }
    }

    const formatterConfig = config.formatter[formatter]
    if (formatterConfig?.plugins) {
      for (const p of formatterConfig.plugins) {
        formatterPlugins.add(p)
      }
    }

    if (linter === 'oxlint') {
      const oxConfig = config.linter.oxlint
      if (oxConfig?.plugins) {
        for (const p of oxConfig.plugins) {
          oxlintPlugins.add(p)
        }
      }
    }
  }

  return {
    linterPlugins: [...linterPlugins].sort(),
    formatterPlugins: [...formatterPlugins].sort(),
    oxlintPlugins: [...oxlintPlugins].sort(),
  }
}

export function getAllDeps(linter: string, formatter: string, plugins: CollectedPlugins): string[] {
  const deps = new Set<string>()

  if (linter === 'eslint') {
    deps.add('eslint')
    deps.add('@eslint/js')
  } else if (linter === 'oxlint') {
    deps.add('oxlint')
  } else if (linter === 'biome') {
    deps.add('@biomejs/biome')
  }

  if (formatter === 'prettier') {
    deps.add('prettier')
  } else if (formatter === 'oxfmt') {
    deps.add('oxfmt')
  } else if (formatter === 'biome' && !deps.has('@biomejs/biome')) {
    deps.add('@biomejs/biome')
  }

  for (const p of plugins.linterPlugins) {
    deps.add(p)
  }

  for (const p of plugins.formatterPlugins) {
    deps.add(p)
  }

  return [...deps].sort()
}
