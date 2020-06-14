import packageJson from "../../../package.json"

export function getAPIVersion(): string {
	return packageJson.codecharta.apiVersion
}

export function getVersion(): string {
	return packageJson.version
}
