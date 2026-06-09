import { test, expect, describe, spyOn, beforeEach, afterEach } from 'bun:test'

import { GetLinterUseCase } from '@/app/get-linter.use-case'
import * as selectModule from '@/utils/select'

describe('GetLinterUseCase', () => {
  let selectSpy: ReturnType<typeof spyOn<typeof selectModule, 'Select'>>

  beforeEach(() => {
    selectSpy = spyOn(selectModule, 'Select').mockResolvedValue('eslint' as never)
  })

  afterEach(() => {
    selectSpy.mockRestore()
  })

  test('returns the only common linter without prompting when all selected techs share exactly one', async () => {
    const useCase = new GetLinterUseCase()
    const linter = await useCase.execute(['astro', 'typescript'])
    expect(linter).toBe('eslint')
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test('returns the only common linter when a single tech (with one linter option) is selected', async () => {
    const useCase = new GetLinterUseCase()
    const linter = await useCase.execute(['astro'])
    expect(linter).toBe('eslint')
    expect(selectSpy).not.toHaveBeenCalled()
  })

  test('prompts the user when there are multiple common linters', async () => {
    selectSpy.mockResolvedValue('biome' as never)
    const useCase = new GetLinterUseCase()
    const linter = await useCase.execute(['typescript', 'next'])
    expect(linter).toBe('biome')
    expect(selectSpy).toHaveBeenCalledTimes(1)
    const call = selectSpy.mock.calls[0]![0] as { message: string; options: { value: string }[] }
    expect(call.message).toBe('Select your linter:')
    expect(call.options.map((o) => o.value).sort()).toEqual(['biome', 'eslint', 'oxlint'])
  })

  test('returns the value chosen by the user via the Select prompt', async () => {
    selectSpy.mockResolvedValue('oxlint' as never)
    const useCase = new GetLinterUseCase()
    const linter = await useCase.execute(['react', 'next'])
    expect(linter).toBe('oxlint')
  })

  test('exits the process when there is no common linter across the selected techs', async () => {
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)
    const useCase = new GetLinterUseCase()
    await expect(useCase.execute(['unknown-tech'])).rejects.toThrow('process.exit called')
    expect(exitSpy).toHaveBeenCalledWith(1)
    exitSpy.mockRestore()
  })

  test('exits the process when no techs are selected', async () => {
    const exitSpy = spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit called')
    }) as never)
    const useCase = new GetLinterUseCase()
    await expect(useCase.execute([])).rejects.toThrow('process.exit called')
    expect(exitSpy).toHaveBeenCalledWith(1)
    exitSpy.mockRestore()
  })

  test('intersects (not unions) when only some techs share linters', async () => {
    selectSpy.mockResolvedValue('eslint' as never)
    const useCase = new GetLinterUseCase()
    const linter = await useCase.execute(['astro', 'typescript', 'react'])
    expect(linter).toBe('eslint')
    expect(selectSpy).not.toHaveBeenCalled()
  })
})
