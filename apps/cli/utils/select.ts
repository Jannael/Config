import { cancel, isCancel, select } from '@clack/prompts'

export async function Select({ message, options }: { message: string; options: { value: string; label: string }[] }) {
	const selected = await select({
		message,
		options,
	})

	if (isCancel(selected)) {
		cancel('Operation cancelled.')
		process.exit(0)
	}

	return selected
}
