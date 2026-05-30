import { cancel, isCancel, select } from '@clack/prompts'

export async function Select<T extends string>({
  message,
  options,
}: {
  message: string
  options: { value: T; label: string; hint?: string }[]
}): Promise<T> {
  const result = await select({ message, options })

  if (isCancel(result)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return result as T
}
