import { spinner } from '@clack/prompts'

let currentSpinner: ReturnType<typeof spinner> | null = null

export function startSpinner(message: string): void {
  currentSpinner = spinner()
  currentSpinner.start(message)
}

export function stopSpinner(message: string): void {
  currentSpinner?.stop(message)
}
