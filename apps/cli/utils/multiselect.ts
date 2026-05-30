import { cancel, isCancel, multiselect, type Option } from '@clack/prompts'

export async function MultiSelect<T extends string>({
  message,
  options,
}: {
  message: string
  options: Option<T>[]
}): Promise<T[]> {
  const result = await multiselect({ message, options, required: true })

  if (isCancel(result)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return result as T[]
}
