import { log } from '@clack/prompts'

export function logInfo(message: string): void {
  log.info(message)
}

export function logError(message: string): void {
  log.error(message)
}
