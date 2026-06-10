import { test, expect, describe, mock, beforeEach, afterEach } from 'bun:test'

import type { Repository } from '@/domain/repository'
import type { GetDependenciesToInstallUseCase } from '@/app/get-dependencies-to-install.use-case'
import type { GetFormatterUseCase } from '@/app/get-formatter.use-case'
import type { GetLinterUseCase } from '@/app/get-linter.use-case'
import type { WriteFormatterConfigUseCase } from '@/app/write-formatter-config.use-case'
import type { WriteLinterConfigUseCase } from '@/app/write-linter-config.use-case'

mock.module('@/utils/multiselect', () => ({
	MultiSelect: mock(async () => ['typescript']),
}))

mock.module('@/utils/confirm', () => ({
	Confirm: mock(async () => true),
}))

const { Command } = await import('@/app/command')

function createMockRepository(overrides: Partial<Record<keyof Repository, unknown>> = {}): Repository {
	const base = {
		getAutoApproveFlag: mock(() => false),
		installDependencies: mock(async () => {}),
		writeBiomeConfig: mock(async () => {}),
		writePrettierConfig: mock(async () => {}),
		writeEslintConfig: mock(async () => {}),
		writeOxLintConfig: mock(async () => {}),
		writeOxFmtConfig: mock(async () => {}),
		writeLintStagedConfig: mock(async () => {}),
		writeEditorConfig: mock(async () => {}),
		writePackageJsonScripts: mock(async () => {}),
		getEditorExtensions: mock(async () => []),
		initHusky: mock(async () => {}),
	}
	return { ...base, ...overrides } as unknown as Repository
}

function createMockUseCases() {
	return {
		getLinter: { execute: mock(async () => 'eslint') },
		getFormatter: { execute: mock(async () => 'prettier') },
		getDependenciesToInstall: { execute: mock(async () => ['eslint', 'prettier']) },
		writeLinterConfig: { execute: mock(async () => {}) },
		writeFormatterConfig: { execute: mock(async () => {}) },
	}
}

type AnyMock = ReturnType<typeof mock>

describe('Command.execute', () => {
	let Confirm: AnyMock
	let MultiSelect: AnyMock

	beforeEach(async () => {
		const confirmMod = await import('@/utils/confirm')
		const multiMod = await import('@/utils/multiselect')
		Confirm = (confirmMod as unknown as { Confirm: AnyMock }).Confirm
		MultiSelect = (multiMod as unknown as { MultiSelect: AnyMock }).MultiSelect
		Confirm.mockReset()
		MultiSelect.mockReset()
		Confirm.mockResolvedValue(true)
		MultiSelect.mockResolvedValue(['typescript'])
	})

	afterEach(() => {
		Confirm.mockRestore()
		MultiSelect.mockRestore()
	})

	test('runs the full happy path in the correct order', async () => {
		const repo = createMockRepository()
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		const calls: string[] = []
		const record = (name: string, fn: AnyMock) => {
			fn.mock.calls.forEach(() => calls.push(name))
		}
		record('installDependencies', repo.installDependencies as unknown as AnyMock)
		record('useCase.writeLinterConfig', useCases.writeLinterConfig.execute as unknown as AnyMock)
		record('useCase.writeFormatterConfig', useCases.writeFormatterConfig.execute as unknown as AnyMock)
		record('writePackageJsonScripts', repo.writePackageJsonScripts as unknown as AnyMock)
		record('initHusky', repo.initHusky as unknown as AnyMock)
		record('writeLintStagedConfig', repo.writeLintStagedConfig as unknown as AnyMock)

		const idx = (n: string) => calls.indexOf(n)
		expect(idx('installDependencies')).toBeGreaterThan(-1)
		expect(idx('useCase.writeLinterConfig')).toBeGreaterThan(idx('installDependencies'))
		expect(idx('useCase.writeFormatterConfig')).toBeGreaterThan(idx('useCase.writeLinterConfig'))
		expect(idx('writePackageJsonScripts')).toBeGreaterThan(idx('useCase.writeFormatterConfig'))
		expect(idx('initHusky')).toBeGreaterThan(idx('writePackageJsonScripts'))
		expect(idx('writeLintStagedConfig')).toBeGreaterThan(idx('initHusky'))
	})

	test('skips the initial installDependencies but still writes configs when user declines install', async () => {
		Confirm.mockImplementationOnce((async () => false) as never)

		const repo = createMockRepository()
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		const installCalls = (repo.installDependencies as unknown as { mock: { calls: unknown[][] } }).mock.calls
		expect(installCalls).toHaveLength(1)
		expect(installCalls[0]![0]).toEqual({ dependencies: ['husky', 'lint-staged'] })
		expect(useCases.writeLinterConfig.execute).toHaveBeenCalledWith('eslint', ['typescript'])
		expect(useCases.writeFormatterConfig.execute).toHaveBeenCalledWith('prettier', ['typescript'])
		expect(repo.writePackageJsonScripts).toHaveBeenCalledWith('prettier', 'eslint')
	})

	test('skips editor and husky configuration when user declines them', async () => {
		Confirm.mockImplementation((async ({ message }: { message: string }) => !(message.includes('editor') || message.includes('Husky'))) as never)

		const repo = createMockRepository()
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		expect(repo.writeEditorConfig).not.toHaveBeenCalled()
		expect(repo.initHusky).not.toHaveBeenCalled()
		expect(repo.writeLintStagedConfig).not.toHaveBeenCalled()
	})

	test('autoApprove flag bypasses all confirms and runs every step', async () => {
		const repo = createMockRepository({ getAutoApproveFlag: mock(() => true) })
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		expect(Confirm).not.toHaveBeenCalled()
		expect(repo.installDependencies).toHaveBeenCalledTimes(2)
		expect(repo.writeEditorConfig).toHaveBeenCalledTimes(1)
		expect(repo.initHusky).toHaveBeenCalledTimes(1)
		expect(repo.writeLintStagedConfig).toHaveBeenCalledTimes(1)
	})

	test('passes the selected configs to linter and formatter use-cases', async () => {
		MultiSelect.mockResolvedValueOnce(['astro', 'typescript'])

		const repo = createMockRepository()
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		expect(useCases.writeLinterConfig.execute).toHaveBeenCalledWith('eslint', ['astro', 'typescript'])
		expect(useCases.writeFormatterConfig.execute).toHaveBeenCalledWith('prettier', ['astro', 'typescript'])
	})

	test('does not throw when no editor extensions are returned', async () => {
		const repo = createMockRepository({ getEditorExtensions: mock(async () => []) })
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await expect(command.execute()).resolves.toBeUndefined()
	})

	test('husky is initialized before lint-staged config is written', async () => {
		const repo = createMockRepository()
		const useCases = createMockUseCases()

		const command = new Command(
			repo as Repository,
			useCases.writeFormatterConfig as unknown as WriteFormatterConfigUseCase,
			useCases.writeLinterConfig as unknown as WriteLinterConfigUseCase,
			useCases.getDependenciesToInstall as unknown as GetDependenciesToInstallUseCase,
			useCases.getLinter as unknown as GetLinterUseCase,
			useCases.getFormatter as unknown as GetFormatterUseCase,
		)

		await command.execute()

		const initHuskyOrder = (repo.initHusky as unknown as AnyMock).mock.invocationCallOrder[0]
		const lintStagedOrder = (repo.writeLintStagedConfig as unknown as AnyMock).mock.invocationCallOrder[0]
		expect(initHuskyOrder).toBeGreaterThan(0)
		expect(lintStagedOrder!).toBeGreaterThan(initHuskyOrder!)
	})
})
