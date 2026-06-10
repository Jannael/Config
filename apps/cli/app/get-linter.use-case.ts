import type { Linters } from '@/configs/types'
import Print from '@/utils/print'
import { Select } from '@/utils/select'
import configs from 'configs'

export class GetLinterUseCase {
	private async GetCommonLinters(selectedConfigs: string[]): Promise<string[]> {
		const allLinterSets = selectedConfigs.map((tech) => {
			const config = configs.techs[tech as keyof typeof configs.techs]
			return new Set(Object.keys(config?.linter ?? {}))
		})

		const commonLinters = allLinterSets.reduce((acc, set) => {
			return new Set([...acc].filter((linter) => set.has(linter)))
		}, allLinterSets[0] || new Set<string>())

		return [...commonLinters]
	}

	public async execute(selectedConfigs: string[]): Promise<Linters> {
		const commonLinters = await this.GetCommonLinters(selectedConfigs)
		let linter: string = commonLinters.length === 1 ? commonLinters[0]! : ''

		if (commonLinters.length === 0) {
			Print.error('No common linters found for the selected technologies.')
			process.exit(1)
		}

		if (commonLinters.length > 1) {
			linter = await Select({
				message: 'Select your linter:',
				options: commonLinters.map((linter) => {
					return {
						value: linter,
						label: linter,
					}
				}),
			})
		}
		return linter as Linters
	}
}
