import angular from '@/domain/data/angular.json'
import astro from '@/domain/data/astro.json'
import javascript from '@/domain/data/javascript.json'
import lit from '@/domain/data/lit.json'
import next from '@/domain/data/next.json'
import nuxt from '@/domain/data/nuxt.json'
import qwik from '@/domain/data/qwik.json'
import react from '@/domain/data/react.json'
import reactNative from '@/domain/data/react-native.json'
import remix from '@/domain/data/remix.json'
import solid from '@/domain/data/solid.json'
import svelte from '@/domain/data/svelte.json'
import sveltekit from '@/domain/data/sveltekit.json'
import tailwind from '@/domain/data/tailwind.json'
import typescript from '@/domain/data/typescript.json'
import vue from '@/domain/data/vue.json'
import type { TechConfig, ResolveResult, CollectedPlugins } from '@/domain/types'

const dataMap: Record<string, TechConfig> = {
  angular,
  astro,
  javascript,
  lit,
  next,
  nuxt,
  qwik,
  react,
  'react-native': reactNative,
  remix,
  solid,
  svelte,
  sveltekit,
  tailwind,
  typescript,
  vue,
}

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

    if (linter === 'oxlint' || config.linter.oxlint) {
      const oxConfig = config.linter.oxlint
      if (oxConfig && 'plugins' in oxConfig && Array.isArray(oxConfig.plugins)) {
        for (const p of oxConfig.plugins as string[]) {
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

function getBaseDeps(linter: string, formatter: string): string[] {
  const deps: string[] = []

  switch (linter) {
    case 'eslint':
      deps.push('eslint', '@eslint/js')
      break
    case 'oxlint':
      deps.push('oxlint')
      break
    case 'biome':
      deps.push('@biomejs/biome')
      break
  }

  switch (formatter) {
    case 'prettier':
      deps.push('prettier')
      break
    case 'oxfmt':
      deps.push('oxfmt')
      break
    case 'biome':
      if (!deps.includes('@biomejs/biome')) {
        deps.push('@biomejs/biome')
      }
      break
  }

  return deps
}

export function getAllDeps(linter: string, formatter: string, plugins: CollectedPlugins): string[] {
  const deps = new Set(getBaseDeps(linter, formatter))

  for (const p of plugins.linterPlugins) {
    deps.add(p)
  }

  for (const p of plugins.formatterPlugins) {
    deps.add(p)
  }

  return [...deps].sort()
}
