# Plan: CLI @jannael/config - Configurador de Linters y Formatters

## Contexto

El usuario quiere un CLI que resuelva un problema común en el ecosistema JS/TS: configurar linters y formatters de manera correcta según las tecnologías del proyecto. El enfoque es "tech-first" - el usuario elige sus tecnologías y el CLI determina qué herramientas son compatibles, en lugar de elegir la herramienta primero y descubrir que no soporta la tecnología.

**Reglas de estilo fijas:**

- No semicolons
- Single quotes
- lineWidth: 100
- Tailwind: sortClasses (via prettier-plugin-tailwindcss)

**Restricción importante:** No incluir herramientas con soporte parcial o experimental. Solo soporte completo y estable.

## Flujo del CLI

1. Mostrar ASCII art (ya existe en `ascii.ts`)
2. Seleccionar package manager: npm, bun, pnpm, yarn
3. Multiselect de tecnologías (todas las disponibles)
4. Resolver intersección de linters/formatters compatibles
5. Si hay múltiples opciones → dejar elegir; si solo hay una → auto-seleccionar
6. Mostrar confirmación de dependencias a instalar
7. Generar archivos de configuración
8. Instalar dependencias

## Estructura de Archivos

```
apps/cli/
├── index.ts              → Entry point + orquestación del flujo completo
├── ascii.ts              → (ya existe, sin cambios)
├── data/
│   ├── index.ts          → Map de tecnologías (nombre archivo → nombre oficial)
│   ├── react.json        → Configs de linter/formatter por tecnología
│   ├── next.json
│   ├── solid.json
│   ├── react-native.json
│   ├── vue.json
│   ├── astro.json
│   ├── lit.json
│   ├── tailwind.json
│   ├── javascript.json
│   └── typescript.json
├── resolver.ts           → Lógica de intersección de herramientas compatibles
├── generators/
│   ├── eslint.ts         → Genera eslint.config.js (flat config)
│   ├── prettier.ts       → Genera .prettierrc
│   ├── biome.ts          → Genera biome.json
│   ├── oxlint.ts         → Genera .oxlintrc.json
│   └── oxfmt.ts          → Genera config de oxfmt
└── installer.ts          → Ejecuta install con el package manager elegido
```

## Paso 1: Crear archivos de datos (`data/`)

### `data/index.ts`

```ts
const technologies: Record<string, string> = {
  astro: 'Astro',
  javascript: 'JavaScript',
  lit: 'Lit',
  next: 'Next.js',
  react: 'React',
  'react-native': 'React Native',
  solid: 'Solid',
  tailwind: 'Tailwind CSS',
  typescript: 'TypeScript',
  vue: 'Vue',
}
export default technologies
```

### Archivos JSON por tecnología

Cada JSON tiene la estructura:

```json
{
  "linter": { "eslint": { "plugins": [...] }, "oxlint": {}, "biome": {} },
  "formatter": { "prettier": { "plugins": [...] }, "oxfmt": {}, "biome": {} }
}
```

**Regla de soporte completo:** Solo incluir una herramienta si tiene soporte completo y estable para esa tecnología.

| Tecnología   | Linters                                                     | Formatters                             |
| ------------ | ----------------------------------------------------------- | -------------------------------------- |
| react        | eslint (eslint-plugin-react, eslint-plugin-react-hooks)     | prettier                               |
| next         | eslint (eslint-config-next)                                 | prettier                               |
| solid        | eslint (eslint-plugin-solid)                                | prettier                               |
| react-native | eslint (@react-native/eslint-config)                        | prettier                               |
| vue          | eslint (eslint-plugin-vue, vue-eslint-parser)               | prettier                               |
| astro        | eslint (eslint-plugin-astro, astro-eslint-parser)           | prettier (prettier-plugin-astro)       |
| lit          | eslint (eslint-plugin-lit, eslint-plugin-wc)                | prettier                               |
| tailwind     | eslint (eslint-plugin-tailwindcss)                          | prettier (prettier-plugin-tailwindcss) |
| javascript   | eslint, oxlint, biome                                       | prettier, oxfmt, biome                 |
| typescript   | eslint (@typescript-eslint/\*), oxlint, biome               | prettier, oxfmt, biome                 |

## Paso 2: Instalar dependencia

```bash
bun add @clack/prompts
```

## Paso 3: `resolver.ts`

### Lógica:

```
Input: string[] (tecnologías seleccionadas)
Output: { linters: string[], formatters: string[] }

1. Para cada tecnología, cargar su JSON de data
2. Extraer las keys de "linter" → set de linters por tecnología
3. Intersección de todos los sets → linters compatibles
4. Extraer las keys de "formatter" → set de formatters por tecnología
5. Intersección de todos los sets → formatters compatibles
6. Si intersección vacía → error
```

### Función adicional: `collectPlugins`

```
Input: string[] (tecnologías), string (linter elegido), string (formatter elegido)
Output: { linterPlugins: string[], formatterPlugins: string[], linterBase: string[], formatterBase: string[] }

Recopila todos los plugins necesarios de todas las tecnologías seleccionadas.
```

## Paso 4: Generadores (`generators/`)

### `generators/prettier.ts`

Genera `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss", ...]
}
```

Los plugins se deduplican de los colectados.

### `generators/eslint.ts`

Genera `eslint.config.js` (flat config):

```js
import js from '@eslint/js'
// imports de plugins según tecnologías
export default [
  js.configs.recommended,
  // configs de cada plugin
  {
    rules: {
      /* reglas de estilo */
    },
  },
]
```

### `generators/biome.ts`

Genera `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "formatter": {
    "enabled": true,
    "lineWidth": 100,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "semicolons": "asNeeded",
      "quoteStyle": "single"
    }
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  }
}
```

### `generators/oxlint.ts`

Genera `.oxlintrc.json` con reglas de estilo equivalentes.

### `generators/oxfmt.ts`

Genera config de oxfmt con reglas de estilo equivalentes.

## Paso 5: `installer.ts`

### Lógica:

```
Input: packageManager, string[] (dependencias)
Output: void

1. Construir comando según package manager:
   - npm: npm install -D ...
   - bun: bun add -d ...
   - pnpm: pnpm add -D ...
   - yarn: yarn add -D ...
2. Ejecutar con child_process.execSync o Bun.spawn
```

### Dependencias base por herramienta:

- **eslint**: `eslint`, `@eslint/js`
- **prettier**: `prettier`
- **biome**: `@biomejs/biome`
- **oxlint**: `oxlint`
- **oxfmt**: `oxfmt`

Más los plugins específicos colectados por el resolver.

## Paso 6: `index.ts` (Entry Point)

```ts
import * as p from "@clack/prompts"
import PrintASCII from "@/ascii.js"
import technologies from "@/data/index.js"
import { resolve, collectPlugins } from "@/resolver.js"
import { generateEslint } from "@/generators/eslint.js"
import { generatePrettier } from "@/generators/prettier.js"
import { generateBiome } from "@/generators/biome.js"
import { install } from "@/installer.js"

async function main() {
  PrintASCII()
  p.intro("Configurador de Linters y Formatters")

  // 1. Package manager
  const pm = await p.select({ message: "Package manager", options: [...] })

  // 2. Tecnologías
  const techs = await p.multiselect({ message: "Tecnologías", options: [...] })

  // 3. Resolver
  const { linters, formatters } = resolve(techs)

  // 4. Elegir linter/formatter si hay múltiples opciones
  const linter = linters.length > 1
    ? await p.select({ message: "Linter", options: [...] })
    : linters[0]

  const formatter = formatters.length > 1
    ? await p.select({ message: "Formatter", options: [...] })
    : formatters[0]

  // 5. Collect plugins
  const plugins = collectPlugins(techs, linter, formatter)

  // 6. Confirmar instalación
  const deps = [...baseDeps, ...plugins]
  await p.confirm({ message: `Se instalarán: ${deps.join(", ")}` })

  // 7. Generar configs
  const spinner = p.spinner()
  spinner.start("Generando configuración...")
  generateEslint(techs, plugins)
  generatePrettier(plugins)
  // etc.
  spinner.stop("Configuración generada")

  // 8. Instalar
  spinner.start("Instalando dependencias...")
  await install(pm, deps)
  spinner.stop("Dependencias instaladas")

  p.outro("Listo! Tu proyecto está configurado.")
}

main()
```

## Archivos a modificar/crear

| Archivo                              | Acción                             |
| ------------------------------------ | ---------------------------------- |
| `apps/cli/data/*.json` (16 archivos) | Crear                              |
| `apps/cli/data/index.ts`             | Crear                              |
| `apps/cli/resolver.ts`               | Crear                              |
| `apps/cli/generators/eslint.ts`      | Crear                              |
| `apps/cli/generators/prettier.ts`    | Crear                              |
| `apps/cli/generators/biome.ts`       | Crear                              |
| `apps/cli/generators/oxlint.ts`      | Crear                              |
| `apps/cli/generators/oxfmt.ts`       | Crear                              |
| `apps/cli/installer.ts`              | Crear                              |
| `apps/cli/index.ts`                  | Modificar (actualmente casi vacío) |
| `package.json`                       | Modificar (agregar @clack/prompts) |

## Verificación

1. `bun run build` debe compilar sin errores
2. Ejecutar el CLI con `bun run dist/index.js` y verificar el flujo completo
3. Probar con diferentes combinaciones de tecnologías:
   - `astro + tailwind` → debe resolver solo eslint + prettier
   - `javascript + typescript` → debe ofrecer eslint/oxlint/biome y prettier/oxfmt/biome
   - `react + vue` → debe resolver solo eslint + prettier
4. Verificar que los archivos generados (.prettierrc, eslint.config.js, etc.) sean válidos
5. Verificar que `bun run lint` pase en el proyecto
