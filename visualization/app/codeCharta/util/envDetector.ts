export function isStandalone(): boolean {
	return JSON.parse(process.env.STANDALONE)
}
