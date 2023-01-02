export function isDevelopment(): boolean {
	return process.env.DEV === undefined ? false : process.env.DEV === "true"
}
