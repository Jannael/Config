import type { Terminal, ConfigWriter, PackageInstaller } from '@/app/ports'
import { resolve, collectPlugins, getAllDeps } from '@/domain/resolver'
import type { PackageManager } from '@/domain/types'

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

export async function configureProject(
  terminal: Terminal,
  configWriter: ConfigWriter,
  installer: PackageInstaller,
  detectedPm: PackageManager | null,
): Promise<void> {
  terminal.intro('Linter & Formatter Configurator')

  let pm: PackageManager
  if (detectedPm) {
    pm = detectedPm
    terminal.logInfo(`Package manager: ${pm} (auto-detected)`)
  } else {
    const pmChoice = await terminal.selectPackageManager()
    if (pmChoice === null) {
      terminal.cancel('Operation cancelled')
      process.exit(0)
    }
    pm = pmChoice
  }

  const techOptions = Object.entries(technologies).map(([value, label]) => ({ value, label }))
  const techs = await terminal.selectTechnologies(techOptions)
  if (techs === null) {
    terminal.cancel('Operation cancelled')
    process.exit(0)
  }

  const { linters, formatters } = resolve(techs)

  if (linters.length === 0 || formatters.length === 0) {
    terminal.cancel('No compatible linter/formatter combination for the selected technologies.')
    process.exit(1)
  }

  let selectedLinter: string
  if (linters.length === 1) {
    selectedLinter = linters[0]!
    terminal.logInfo(`Linter: ${linterNames[selectedLinter]} (only compatible option)`)
  } else {
    const linterChoice = await terminal.selectLinter(
      linters.map((l) => ({ value: l, label: linterNames[l] || l })),
    )
    if (linterChoice === null) {
      terminal.cancel('Operation cancelled')
      process.exit(0)
    }
    selectedLinter = linterChoice
  }

  let selectedFormatter: string
  if (formatters.length === 1) {
    selectedFormatter = formatters[0]!
    terminal.logInfo(`Formatter: ${formatterNames[selectedFormatter]} (only compatible option)`)
  } else {
    const formatterChoice = await terminal.selectFormatter(
      formatters.map((f) => ({ value: f, label: formatterNames[f] || f })),
    )
    if (formatterChoice === null) {
      terminal.cancel('Operation cancelled')
      process.exit(0)
    }
    selectedFormatter = formatterChoice
  }

  const plugins = collectPlugins(techs, selectedLinter, selectedFormatter)
  const deps = getAllDeps(selectedLinter, selectedFormatter, plugins)

  const shouldInstall = await terminal.confirmInstall(deps)
  if (shouldInstall === null || !shouldInstall) {
    terminal.cancel('Operation cancelled')
    process.exit(0)
  }

  const cwd = process.cwd()

  terminal.startSpinner('Generating configuration...')
  configWriter.writeLinterConfig(selectedLinter, plugins.linterPlugins, cwd)
  configWriter.writeFormatterConfig(selectedFormatter, plugins.formatterPlugins, cwd)
  terminal.stopSpinner('Configuration generated')

  terminal.startSpinner('Installing dependencies...')
  try {
    installer.install(pm, deps, cwd)
    terminal.stopSpinner('Dependencies installed')
  } catch {
    terminal.stopSpinner('Error installing dependencies')
    const flag = pm === 'npm' || pm === 'pnpm' ? 'install -D' : pm === 'yarn' ? 'add -D' : 'add -d'
    terminal.logError(`Run manually: ${pm} ${flag} ${deps.join(' ')}`)
  }

  terminal.outro('Done! Your project is configured.')
}
