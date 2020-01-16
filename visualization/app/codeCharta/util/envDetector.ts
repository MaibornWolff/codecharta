export class EnvDetector {
	public static isNodeJs(): boolean {
		console.log(
			"IS NODE",
			typeof process === "object",
			typeof process.versions === "object",
			typeof process.versions.node !== "undefined"
		)
		return typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined"
	}
}
