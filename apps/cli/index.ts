import * as p from '@clack/prompts'
import PrintASCII from '@/ascii'
import technologies from '@/data/index'
import { resolve, collectPlugins, getAllDeps } from '@/resolver'
import type { PackageManager } from '@/installer'
import { generateEslint } from '@/generators/eslint'
import { generatePrettier } from '@/generators/prettier'
import { generateBiome } from '@/generators/biome'
import { generateOxlint } from '@/generators/oxlint'
import { generateOxfmt } from '@/generators/oxfmt'
import { install } from '@/installer'

function detectPackageManager(): PackageManager | null {
  if (typeof process.versions.bun !== 'undefined') return 'bun'

  const binPath = process.argv[1] ?? ''
  if (binPath.includes('pnpm')) return 'pnpm'
  if (binPath.includes('yarn')) return 'yarn'
  if (binPath.includes('npx') || binPath.includes('npm')) return 'npm'

  const userAgent = process.env.npm_config_user_agent ?? ''
  if (userAgent.startsWith('pnpm')) return 'pnpm'
  if (userAgent.startsWith('yarn')) return 'yarn'
  if (userAgent.startsWith('npm')) return 'npm'

  return null
}

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
  p.intro('Linter & Formatter Configurator')

  let pm: PackageManager
  const detectedPm = detectPackageManager()

  if (detectedPm) {
    pm = detectedPm
    p.log.info(`Package manager: ${pm} (auto-detected)`)
  } else {
    const pmChoice = (await p.select({
      message: 'Select your package manager',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'bun', label: 'bun' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    })) as PackageManager | symbol

    if (p.isCancel(pmChoice)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    pm = pmChoice
  }

  const techOptions = Object.entries(technologies).map(([key, label]) => ({
    value: key,
    label,
  }))

  const techs = (await p.multiselect({
    message: 'Select your technologies',
    options: techOptions,
    required: true,
  })) as string[] | symbol

  if (p.isCancel(techs)) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  const { linters, formatters } = resolve(techs)

  if (linters.length === 0 || formatters.length === 0) {
    p.cancel('No compatible linter/formatter combination for the selected technologies.')
    process.exit(1)
  }

  let selectedLinter: string
  if (linters.length === 1) {
    selectedLinter = linters[0]!
    p.log.info(`Linter: ${linterNames[selectedLinter]} (only compatible option)`)
  } else {
    const linterChoice = (await p.select({
      message: 'Select your linter',
      options: linters.map((l) => ({
        value: l,
        label: linterNames[l] || l,
      })),
    })) as string | symbol

    if (p.isCancel(linterChoice)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    selectedLinter = linterChoice
  }

  let selectedFormatter: string
  if (formatters.length === 1) {
    selectedFormatter = formatters[0]!
    p.log.info(`Formatter: ${formatterNames[selectedFormatter]} (only compatible option)`)
  } else {
    const formatterChoice = (await p.select({
      message: 'Select your formatter',
      options: formatters.map((f) => ({
        value: f,
        label: formatterNames[f] || f,
      })),
    })) as string | symbol

    if (p.isCancel(formatterChoice)) {
      p.cancel('Operation cancelled')
      process.exit(0)
    }
    selectedFormatter = formatterChoice
  }

  const plugins = collectPlugins(techs, selectedLinter, selectedFormatter)
  const deps = getAllDeps(selectedLinter, selectedFormatter, plugins)

  const shouldInstall = await p.confirm({
    message: `The following dependencies will be installed:\n${deps.join(', ')}\n\nContinue?`,
    initialValue: true,
  })

  if (p.isCancel(shouldInstall) || !shouldInstall) {
    p.cancel('Operation cancelled')
    process.exit(0)
  }

  const cwd = process.cwd()
  const spinner = p.spinner()

  spinner.start('Generating configuration...')

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

  spinner.stop('Configuration generated')

  spinner.start('Installing dependencies...')
  try {
    install(pm, deps, cwd)
    spinner.stop('Dependencies installed')
  } catch {
    spinner.stop('Error installing dependencies')
    p.log.error(
      `Run manually: ${pm} ${pm === 'npm' || pm === 'pnpm' || pm === 'yarn' ? (pm === 'yarn' ? 'add -D' : 'install -D') : 'add -d'} ${deps.join(' ')}`,
    )
  }

  p.outro('Done! Your project is configured.')
}

main()
