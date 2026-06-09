import { test, expect, describe, spyOn, beforeEach, afterEach } from 'bun:test'

import { GetFormatterUseCase } from '@/app/get-formatter.use-case'
import * as selectModule from '@/utils/select'

describe('GetFormatterUseCase', () => {
  let selectSpy: ReturnType<typeof spyOn<typeof selectModule, 'Select'>>

  beforeEach(() => {
    selectSpy = spyOn(selectModule, 'Select').mockResolvedValue('prettier' as never)
  })

  afterEach(() => {
    selectSpy.mockRestore()
  })

  test('returns the only common formatter without prompting when all selected techs share exactly one', async () => {
    const useCase = new GetFormatterUseCase()
    const formatter = await useCase.execute(['astro', 'typescript'])
    expect(formatter).toBe('prettier')
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test('returns the only common formatter when a single tech (with one formatter option) is selected', async () => {
    const useCase = new GetFormatterUseCase()
    const formatter = await useCase.execute(['astro'])
    expect(formatter).toBe('prettier')
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test('prompts the user when there are multiple common formatters', async () => {
    selectSpy.mockResolvedValue('oxfmt' as never)
    const useCase = new GetFormatterUseCase()
    const formatter = await useCase.execute(['react', 'typescript'])
    expect(formatter).toBe('oxfmt')
    expect(selectSpy).toHaveBeenCalledTimes(1)
    const call = selectSpy.mock.calls[0]![0] as { message: string; options: { value: string }[] }
    expect(call.message).toBe('Select your formatter:')
    expect(call.options.map((o) => o.value).sort()).toEqual(['biome', 'oxfmt', 'prettier'])
  })

  test('returns the value chosen by the user via the Select prompt', async () => {
    selectSpy.mockResolvedValue('biome' as never)
    const useCase = new GetFormatterUseCase()
    const formatter = await useCase.execute(['react', 'typescript'])
    expect(formatter).toBe('biome')
  })

  test('exits the process when there is no common formatter across the selected techs', async () => {
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)
    const useCase = new GetFormatterUseCase()
    await expect(useCase.execute(['unknown-tech'])).rejects.toThrow('process.exit called')
    expect(exitSpy).toHaveBeenCalledWith(1)
    exitSpy.mockRestore()
  })

  test('intersects (not unions) when only some techs share formatters', async () => {
    selectSpy.mockResolvedValue('prettier' as never)
    const useCase = new GetFormatterUseCase()
    const formatter = await useCase.execute(['astro', 'typescript', 'react'])
    expect(formatter).toBe('prettier')
    expect(selectSpy).not.toHaveBeenCalled()
  })
})
