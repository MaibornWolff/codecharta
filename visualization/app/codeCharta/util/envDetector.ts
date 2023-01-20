export function isDevelopment(): boolean {
	return false
	// todo NG
	// return process.env.DEV === undefined ? false : JSON.parse(process.env.DEV)
}
