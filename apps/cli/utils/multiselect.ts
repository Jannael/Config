import { cancel, isCancel, multiselect } from '@clack/prompts'

export async function MultiSelect<T extends string>({
  message,
  options,
}: {
  message: string
  options: { value: T; label: string; hint?: string; disabled?: boolean }[]
}): Promise<T[]> {
  const result = await multiselect({ message, options, required: true })

  if (isCancel(result)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return result as T[]
}
