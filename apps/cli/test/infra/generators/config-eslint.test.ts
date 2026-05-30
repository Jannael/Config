import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'

vi.mock('node:fs', () => ({
  writeFileSync: vi.fn(),
}))

import { writeFileSync } from 'node:fs'
import { generateEslint } from '@/infra/generators/eslint'

describe('generateEslint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('eslint config without plugins', () => {
    /*
      Flow:
      1. Call generateEslint with empty plugins array
      2. Verify writeFileSync called with eslint.config.js path
      3. Verify content contains @eslint/js import and js.configs.recommended
    */
    const cwd = '/test/project'
    generateEslint({ plugins: [], cwd })

    expect(writeFileSync).toHaveBeenCalledOnce()
    const [path, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(path).toBe(join(cwd, 'eslint.config.js'))
    expect(content).toContain('import js from "@eslint/js"')
    expect(content).toContain('js.configs.recommended')
    expect(content).toContain('export default [')
  })

  it('eslint config with react plugin', () => {
    /*
      Flow:
      1. Call generateEslint with eslint-plugin-react in plugins
      2. Verify content contains react import and config spread
    */
    const cwd = '/test/project'
    generateEslint({ plugins: ['eslint-plugin-react'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(content).toContain('import react from "eslint-plugin-react"')
    expect(content).toContain('plugins: { react }')
    expect(content).toContain('settings: { react: { version: "detect" } }')
  })

  it('eslint config with typescript plugin', () => {
    /*
      Flow:
      1. Call generateEslint with @typescript-eslint/eslint-plugin
      2. Verify content contains typescript-eslint import
      3. Verify no-unused-vars rule is overridden for typescript
    */
    const cwd = '/test/project'
    generateEslint({ plugins: ['@typescript-eslint/eslint-plugin'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(content).toContain('import tsEslint from "typescript-eslint"')
    expect(content).toContain('"no-unused-vars": "off"')
    expect(content).toContain('"@typescript-eslint/no-unused-vars": "warn"')
  })

  it('eslint config with multiple plugins', () => {
    /*
      Flow:
      1. Call generateEslint with react and react-hooks plugins
      2. Verify both imports are present
      3. Verify no duplicate imports
    */
    const cwd = '/test/project'
    generateEslint({ plugins: ['eslint-plugin-react', 'eslint-plugin-react-hooks'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(content).toContain('import react from "eslint-plugin-react"')
    expect(content).toContain('import reactHooks from "eslint-plugin-react-hooks"')
    expect(content.match(/import react from/g)?.length).toBe(1)
  })

  it('eslint config with vue plugins', () => {
    /*
      Flow:
      1. Call generateEslint with vue plugins
      2. Verify vue plugin and parser imports are present
    */
    const cwd = '/test/project'
    generateEslint({ plugins: ['eslint-plugin-vue', 'vue-eslint-parser'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(content).toContain('import pluginVue from "eslint-plugin-vue"')
    expect(content).toContain('import vueParser from "vue-eslint-parser"')
    expect(content).toContain('languageOptions: { parser: vueParser }')
  })

  it('eslint config with tailwind plugin', () => {
    /*
      Flow:
      1. Call generateEslint with eslint-plugin-tailwindcss
      2. Verify tailwind import and config spread are present
    */
    const cwd = '/test/project'
    generateEslint({ plugins: ['eslint-plugin-tailwindcss'], cwd })

    const [, content] = vi.mocked(writeFileSync).mock.calls[0]!

    expect(content).toContain('import tailwind from "eslint-plugin-tailwindcss"')
    expect(content).toContain('plugins: { tailwind }')
  })
})
