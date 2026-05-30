import { cancel, confirm, isCancel } from '@clack/prompts'

export async function Confirm({
  message,
  initialValue = true,
}: {
  message: string
  initialValue?: boolean
}): Promise<boolean> {
  const result = await confirm({ message, initialValue })

  if (isCancel(result)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return result
}
