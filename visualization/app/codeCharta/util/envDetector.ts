export function isStandalone(): boolean {
	return false
}

export function isDevelopment(): boolean {
	return process.env.DEV === undefined ? false : JSON.parse(process.env.DEV)
}
