import { cancel, isCancel, multiselect } from '@clack/prompts'

export async function MultiSelect({
	message,
	options,
}: {
	message: string
	options: {
		value: string
		label: string
		hint?: string
		disabled?: boolean
	}[]
}) {
	const selected = await multiselect({
		message,
		options,
		required: true,
	})

	if (isCancel(selected)) {
		cancel('Operation cancelled.')
		process.exit(0)
	}

	return selected
}
