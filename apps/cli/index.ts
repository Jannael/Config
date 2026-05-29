import * as p from '@clack/prompts'
import PrintASCII from '@/ascii.js'
import technologies from '@/data/index.js'
import { resolve, collectPlugins, getAllDeps } from '@/resolver.js'
import type { PackageManager } from '@/installer.js'
import { generateEslint } from '@/generators/eslint.js'
import { generatePrettier } from '@/generators/prettier.js'
import { generateBiome } from '@/generators/biome.js'
import { generateOxlint } from '@/generators/oxlint.js'
import { generateOxfmt } from '@/generators/oxfmt.js'
import { install } from '@/installer.js'

const linterNames: Record<string, string> = {
  eslint: 'ESLint',
  oxlint: 'Oxlint',
  biome: 'Biome',
}

const formatterNames: Record<string, string> = {
  prettier: 'Prettier',
  oxfmt: 'Oxfmt',
  biome: 'Biome',
}

async function main() {
  PrintASCII()
  p.intro('Configurador de Linters y Formatters')

  const pm = (await p.select({
    message: 'Selecciona tu package manager',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'bun', label: 'bun' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'yarn', label: 'yarn' },
    ],
  })) as PackageManager | symbol

  if (p.isCancel(pm)) {
    p.cancel('Operación cancelada')
    process.exit(0)
  }

  const techOptions = Object.entries(technologies).map(([key, label]) => ({
    value: key,
    label,
  }))

  const techs = (await p.multiselect({
    message: 'Selecciona tus tecnologías',
    options: techOptions,
    required: true,
  })) as string[] | symbol

  if (p.isCancel(techs)) {
    p.cancel('Operación cancelada')
    process.exit(0)
  }

  const { linters, formatters } = resolve(techs)

  if (linters.length === 0 || formatters.length === 0) {
    p.cancel(
      'No hay combinación de linter/formatter compatible con todas las tecnologías seleccionadas.',
    )
    process.exit(1)
  }

  let selectedLinter: string
  if (linters.length === 1) {
    selectedLinter = linters[0]!
    p.log.info(`Linter: ${linterNames[selectedLinter]} (única opción compatible)`)
  } else {
    const linterChoice = (await p.select({
      message: 'Selecciona tu linter',
      options: linters.map((l) => ({
        value: l,
        label: linterNames[l] || l,
      })),
    })) as string | symbol

    if (p.isCancel(linterChoice)) {
      p.cancel('Operación cancelada')
      process.exit(0)
    }
    selectedLinter = linterChoice
  }

  let selectedFormatter: string
  if (formatters.length === 1) {
    selectedFormatter = formatters[0]!
    p.log.info(`Formatter: ${formatterNames[selectedFormatter]} (única opción compatible)`)
  } else {
    const formatterChoice = (await p.select({
      message: 'Selecciona tu formatter',
      options: formatters.map((f) => ({
        value: f,
        label: formatterNames[f] || f,
      })),
    })) as string | symbol

    if (p.isCancel(formatterChoice)) {
      p.cancel('Operación cancelada')
      process.exit(0)
    }
    selectedFormatter = formatterChoice
  }

  const plugins = collectPlugins(techs, selectedLinter, selectedFormatter)
  const deps = getAllDeps(selectedLinter, selectedFormatter, plugins)

  const shouldInstall = await p.confirm({
    message: `Se instalarán las siguientes dependencias:\n${deps.join(', ')}\n\n¿Continuar?`,
    initialValue: true,
  })

  if (p.isCancel(shouldInstall) || !shouldInstall) {
    p.cancel('Operación cancelada')
    process.exit(0)
  }

  const cwd = process.cwd()
  const spinner = p.spinner()

  spinner.start('Generando configuración...')

  switch (selectedLinter) {
    case 'eslint':
      generateEslint(plugins.linterPlugins, cwd)
      break
    case 'oxlint':
      generateOxlint(plugins.oxlintPlugins, cwd)
      break
    case 'biome':
      generateBiome(cwd)
      break
  }

  switch (selectedFormatter) {
    case 'prettier':
      generatePrettier(plugins.formatterPlugins, cwd)
      break
    case 'oxfmt':
      generateOxfmt(cwd)
      break
    case 'biome':
      if (selectedLinter !== 'biome') {
        generateBiome(cwd)
      }
      break
  }

  spinner.stop('Configuración generada')

  spinner.start('Instalando dependencias...')
  try {
    install(pm, deps, cwd)
    spinner.stop('Dependencias instaladas')
  } catch {
    spinner.stop('Error al instalar dependencias')
    p.log.error(
      `Ejecuta manualmente: ${pm} ${pm === 'npm' || pm === 'pnpm' || pm === 'yarn' ? (pm === 'yarn' ? 'add -D' : 'install -D') : 'add -d'} ${deps.join(' ')}`,
    )
  }

  p.outro('Listo! Tu proyecto está configurado.')
}

main()
