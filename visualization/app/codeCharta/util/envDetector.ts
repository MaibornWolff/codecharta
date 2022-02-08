export function isDevelopment(): boolean {
	return process.env.DEV === undefined ? false : JSON.parse(process.env.DEV)
}
