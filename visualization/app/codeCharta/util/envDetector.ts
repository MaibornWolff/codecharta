export function isStandalone(): boolean {
	return JSON.parse(process.env.STANDALONE)
}

export function isDevelopment(): boolean {
	return process.env.DEV === undefined ? false : JSON.parse(process.env.DEV);
}
