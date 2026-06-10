class Print {
	private static readonly RESET = '\x1b[0m'

	// ── Primitives ───────────────────────────────────────────────
	static GREEN = (text: string) => `\x1b[32m${text}${Print.RESET}`
	static YELLOW = (text: string) => `\x1b[33m${text}${Print.RESET}`
	static RED = (text: string) => `\x1b[31m${text}${Print.RESET}`
	static MAGENTA = (text: string) => `\x1b[35m${text}${Print.RESET}`
	static BLUE = (text: string) => `\x1b[34m${text}${Print.RESET}`
	static BOLD = (text: string) => `\x1b[1m${text}${Print.RESET}`
	static DIM = (text: string) => `\x1b[2m${text}${Print.RESET}`
	static BLACK = (text: string) => `\x1b[30m${text}${Print.RESET}`
	static WHITE = (text: string) => `\x1b[37m${text}${Print.RESET}`
	static BG_YELLOW = (text: string) => `\x1b[43m${text}${Print.RESET}`
	static BG_RED = (text: string) => `\x1b[41m${text}${Print.RESET}`
	static BG_BLUE = (text: string) => `\x1b[44m${text}${Print.RESET}`
	static BG_GREEN = (text: string) => `\x1b[42m${text}${Print.RESET}`

	// ── Icons ────────────────────────────────────────────────────
	static X = (text: string) => Print.RED(`✖ ${text}`)
	static CHECK = (text: string) => `${Print.GREEN('✔')}  ${text}`
	static WARNING = (text: string) => Print.BG_YELLOW(Print.BLACK(` ⚠ ${text}`))

	// ── Classics ─────────────────────────────────────────────────
	static log = (...parts: string[]) => console.log(parts.join(''))

	static info = (text: string) => console.log(Print.BOLD(Print.WHITE(` ℹ ${text} `)))

	static success = (text: string) => console.log(Print.BG_GREEN(Print.BOLD(Print.BLACK(` ✔ ${text} `))))

	static warn = (text: string) => console.log(Print.BG_YELLOW(Print.BOLD(Print.BLACK(` ⚠ ${text} `))))

	static error = (text: string) => console.log(Print.BG_RED(Print.BOLD(Print.WHITE(` ✖ ${text} `))))

	static debug = (text: string) => console.log(Print.DIM(Print.MAGENTA(`[debug] ${text}`)))

	static trace = (text: string) => console.log(Print.DIM(`[trace] ${text}`))

	static section = (text: string) => {
		const line = '─'.repeat(text.length + 4)
		console.log(Print.BOLD(Print.BLUE(`┌${line}┐`)))
		console.log(Print.BOLD(Print.BLUE(`│  ${text}  │`)))
		console.log(Print.BOLD(Print.BLUE(`└${line}┘`)))
	}
}

export default Print

// Print.info('This is an informational message.')
// Print.error('This is an error message.')
// Print.success('This is a success message.')
// Print.warn('This is a warning message.')
// Print.debug('This is a debug message.')
// Print.trace('This is a trace message.')
// Print.section('Section Title')
