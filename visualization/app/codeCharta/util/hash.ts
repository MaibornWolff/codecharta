export async function hash(text: string): Promise<string> {
	const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
	const hashHex = [...new Uint8Array(hashBuffer)].map(b => b.toString(16)).join("")
	return hashHex
}
