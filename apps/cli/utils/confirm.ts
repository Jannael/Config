import { cancel, confirm, isCancel } from '@clack/prompts'

export async function Confirm({ message, cancelMessage, exitOnCancel = true }: { message: string; cancelMessage?: string; exitOnCancel?: boolean }) {
	const confirmed = await confirm({
		message,
	})

	if (isCancel(confirmed)) {
		if (exitOnCancel) {
			cancel(cancelMessage ?? 'Operation cancelled.')
			process.exit(0)
		}

		return null
	}

	return confirmed
}
