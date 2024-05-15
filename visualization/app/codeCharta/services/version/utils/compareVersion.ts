export function compareVersion(version1: string, version2: string) {
    const semver1 = parseSemver(version1)
    const semver2 = parseSemver(version2)

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

function parseSemver(semverString: string) {
    const semverArray: string[] = semverString.split(".")
    return {
        major: Number.parseInt(semverArray[0]) || 0,
        minor: Number.parseInt(semverArray[1]) || 0,
        patch: Number.parseInt(semverArray[2]) || 0
    }
}
