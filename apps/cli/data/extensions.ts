export type ExtensionInfo = {
  name: string
  vsc: string
  vsx: string
}

export const extensionLinks: Record<string, ExtensionInfo> = {
  biome: {
    name: 'Biome',
    vsc: 'https://marketplace.visualstudio.com/items?itemName=biomejs.biome',
    vsx: 'https://open-vsx.org/extension/biomejs/biome',
  },
  oxlint: {
    name: 'Oxc',
    vsc: 'https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode',
    vsx: 'https://open-vsx.org/extension/oxc/oxc-vscode',
  },
  eslint: {
    name: 'ESLint',
    vsc: 'https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint',
    vsx: 'https://open-vsx.org/extension/dbaeumer/vscode-eslint',
  },
  prettier: {
    name: 'Prettier',
    vsc: 'https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode',
    vsx: 'https://open-vsx.org/extension/esbenp/prettier-vscode',
  },
}

export function getExtensionsToShow(linter: string, formatter: string): ExtensionInfo[] {
  const shown = new Set<string>()
  const result: ExtensionInfo[] = []

  const addExtension = (key: string) => {
    if (shown.has(key)) return
    shown.add(key)
    const ext = extensionLinks[key]
    if (ext) result.push(ext)
  }

  addExtension(linter)

  if (formatter === 'oxfmt') {
    addExtension('oxlint')
  } else {
    addExtension(formatter)
  }

  return result
}
