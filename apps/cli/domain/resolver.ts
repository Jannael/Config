import angular from '@/data/angular.json'
import astro from '@/data/astro.json'
import javascript from '@/data/javascript.json'
import lit from '@/data/lit.json'
import next from '@/data/next.json'
import nuxt from '@/data/nuxt.json'
import qwik from '@/data/qwik.json'
import react from '@/data/react.json'
import reactNative from '@/data/react-native.json'
import remix from '@/data/remix.json'
import solid from '@/data/solid.json'
import svelte from '@/data/svelte.json'
import sveltekit from '@/data/sveltekit.json'
import tailwind from '@/data/tailwind.json'
import typescript from '@/data/typescript.json'
import vue from '@/data/vue.json'
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

export class Resolver {
  resolve({ techs }: { techs: string[] }): ResolveResult {
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

  collectPlugins({
    techs,
    linter,
    formatter,
  }: {
    techs: string[]
    linter: string
    formatter: string
  }): CollectedPlugins {
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

  getAllDeps({
    linter,
    formatter,
    plugins,
  }: {
    linter: string
    formatter: string
    plugins: CollectedPlugins
  }): string[] {
    const deps = new Set(this.getBaseDeps({ linter, formatter }))

    for (const p of plugins.linterPlugins) {
      deps.add(p)
    }

    for (const p of plugins.formatterPlugins) {
      deps.add(p)
    }

    return [...deps].sort()
  }

  private getBaseDeps({ linter, formatter }: { linter: string; formatter: string }): string[] {
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
}
