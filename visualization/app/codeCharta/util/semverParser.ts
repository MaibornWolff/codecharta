export interface semverObject {
	version: string
	major: number
	minor: number
	patch: number
}

export function isValidSemverCore(semverString: string): boolean {
	const semverCore = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){2}$/
	return semverCore.test(semverString)
}

export function parseSemver(semverString: string): semverObject {
	const semver: semverObject = { version: "", major: 0, minor: 0, patch: 0 }
	semver.version = semverString
	const semverArray: string[] = semverString.split(".")
	semver.major = Number.parseInt(semverArray[0])
	semver.minor = Number.parseInt(semverArray[1])
	semver.patch = Number.parseInt(semverArray[2])
	return semver
}
export function compareSemver(semver1: semverObject, semver2: semverObject): number {
	if (semver1.major === semver2.major && semver1.minor === semver2.minor && semver1.patch === semver2.patch) {
		return 0
	}
	if (semver1.major > semver2.major) {
		return 1
	}
	if (semver1.major < semver2.major) {
		return -1
	}
	if (semver1.minor > semver2.minor) {
		return 1
	}
	if (semver1.minor < semver2.minor) {
		return -1
	}
	if (semver1.patch > semver2.patch) {
		return 1
	}
	if (semver1.patch < semver2.patch) {
		return -1
	}
}
