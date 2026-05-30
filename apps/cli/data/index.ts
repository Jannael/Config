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
import type { TechConfig } from '@/domain/types'

const technologies: Record<string, string> = {
  angular: 'Angular',
  astro: 'Astro',
  javascript: 'JavaScript',
  lit: 'Lit',
  next: 'Next.js',
  nuxt: 'Nuxt',
  qwik: 'Qwik',
  react: 'React',
  'react-native': 'React Native',
  remix: 'Remix',
  solid: 'Solid',
  svelte: 'Svelte',
  sveltekit: 'SvelteKit',
  tailwind: 'Tailwind CSS',
  typescript: 'TypeScript',
  vue: 'Vue',
}

export const dataMap: Record<string, TechConfig> = {
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

export const linterNames: Record<string, string> = {
  eslint: 'ESLint',
  oxlint: 'Oxlint',
  biome: 'Biome',
}

export const formatterNames: Record<string, string> = {
  prettier: 'Prettier',
  oxfmt: 'Oxfmt',
  biome: 'Biome',
}

export default technologies
