export class EnvDetector {
	public static isNodeJs(): boolean {
		return typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined"
	}
}
