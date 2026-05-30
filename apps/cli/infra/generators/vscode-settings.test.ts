import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(),
}))

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { generateVscodeSettings } from '@/infra/generators/vscode-settings'

describe('generateVscodeSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('new vscode settings file', () => {
    /*
      Flow:
      1. Mock existsSync to return false (no existing settings)
      2. Call generateVscodeSettings with 'prettier' formatter
      3. Verify .vscode directory is created
      4. Verify settings.json is written with defaultFormatter and formatOnSave
    */
    const cwd = '/test/project'
    vi.mocked(existsSync).mockReturnValue(false)

    generateVscodeSettings({ formatter: 'prettier', cwd })

    expect(mkdirSync).toHaveBeenCalledWith(join(cwd, '.vscode'), { recursive: true })
    expect(writeFileSync).toHaveBeenCalledOnce()

    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!
    expect(path).toBe(join(cwd, '.vscode', 'settings.json'))

    const settings = JSON.parse(content as string)
    expect(settings['editor.defaultFormatter']).toBe('esbenp.prettier-vscode')
    expect(settings['editor.formatOnSave']).toBe(true)
  })

  it('existing settings file without formatOnSave', () => {
    /*
      Flow:
      1. Mock existsSync to return true for settings.json
      2. Mock readFileSync to return existing settings without formatOnSave
      3. Call generateVscodeSettings with 'biome' formatter
      4. Verify formatOnSave is added and defaultFormatter is set to biome
    */
    const cwd = '/test/project'
    vi.mocked(existsSync).mockImplementation((path) => {
      return path === join(cwd, '.vscode', 'settings.json')
    })
    vi.mocked(readFileSync).mockReturnValue('{"editor.fontSize": 14}')

    generateVscodeSettings({ formatter: 'biome', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const settings = JSON.parse(content as string)

    expect(settings['editor.defaultFormatter']).toBe('biomejs.biome')
    expect(settings['editor.formatOnSave']).toBe(true)
    expect(settings['editor.fontSize']).toBe(14)
  })

  it('existing settings file with formatOnSave false', () => {
    /*
      Flow:
      1. Mock existing settings with formatOnSave: false
      2. Call generateVscodeSettings with 'prettier'
      3. Verify formatOnSave remains false (user preference respected)
    */
    const cwd = '/test/project'
    vi.mocked(existsSync).mockImplementation((path) => {
      return path === join(cwd, '.vscode', 'settings.json')
    })
    vi.mocked(readFileSync).mockReturnValue('{"editor.formatOnSave": false}')

    generateVscodeSettings({ formatter: 'prettier', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const settings = JSON.parse(content as string)

    expect(settings['editor.formatOnSave']).toBe(false)
    expect(settings['editor.defaultFormatter']).toBe('esbenp.prettier-vscode')
  })

  it('oxfmt uses oxc extension', () => {
    /*
      Flow:
      1. Call generateVscodeSettings with 'oxfmt' formatter
      2. Verify defaultFormatter is set to oxc.oxc-vscode
    */
    const cwd = '/test/project'
    vi.mocked(existsSync).mockReturnValue(false)

    generateVscodeSettings({ formatter: 'oxfmt', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const settings = JSON.parse(content as string)

    expect(settings['editor.defaultFormatter']).toBe('oxc.oxc-vscode')
  })

  it('settings file with comments (jsonc)', () => {
    /*
      Flow:
      1. Mock existing settings with JSON comments
      2. Call generateVscodeSettings
      3. Verify jsonc-parser handles comments correctly
    */
    const cwd = '/test/project'
    vi.mocked(existsSync).mockImplementation((path) => {
      return path === join(cwd, '.vscode', 'settings.json')
    })
    vi.mocked(readFileSync).mockReturnValue(`{
      // This is a comment
      "editor.fontSize": 14,
      /* Another comment */
      "editor.tabSize": 2
    }`)

    generateVscodeSettings({ formatter: 'biome', cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!
    const settings = JSON.parse(content as string)

    expect(settings['editor.fontSize']).toBe(14)
    expect(settings['editor.tabSize']).toBe(2)
    expect(settings['editor.defaultFormatter']).toBe('biomejs.biome')
  })
})
