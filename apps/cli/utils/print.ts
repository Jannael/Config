export class Print {
  private static readonly RESET = '\x1b[0m'

  // Colors
  static GREEN = (text: string) => `\x1b[32m${text}${Print.RESET}`
  static YELLOW = (text: string) => `\x1b[33m${text}${Print.RESET}`
  static RED = (text: string) => `\x1b[31m${text}${Print.RESET}`
  static MAGENTA = (text: string) => `\x1b[35m${text}${Print.RESET}`
  static BLUE = (text: string) => `\x1b[34m${text}${Print.RESET}`
  static BOLD = (text: string) => `\x1b[1m${text}${Print.RESET}`
  static BLACK = (text: string) => `\x1b[30m${text}${Print.RESET}`
  static BG_YELLOW = (text: string) => `\x1b[43m${text}${Print.RESET}`

  // Icons
  static X = (text: string) => Print.RED(`✖ ${text}`)
  static CHECK = (text: string) => `${Print.GREEN('✔')}  ${text}`
  static WARNING = (text: string) => Print.BG_YELLOW(Print.BLACK(` ⚠ ${text}`))

  constructor(...parts: string[]) {
    console.log(parts.join(''))
  }
}
