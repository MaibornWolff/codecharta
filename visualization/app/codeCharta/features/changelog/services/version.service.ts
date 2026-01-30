import { Injectable } from "@angular/core"
import { VersionStore } from "../stores/version.store"

@Injectable({ providedIn: "root" })
export class VersionService {
    constructor(private readonly versionStore: VersionStore) {}

    get currentVersion() {
        return this.versionStore.currentVersion
    }

    get previousVersion() {
        return this.versionStore.previousVersion
    }

    get shouldShowChangelog() {
        return this.versionStore.shouldShowChangelog
    }

    synchronizeVersion() {
        const savedVersion = this.versionStore.getSavedVersion()

        if (savedVersion === null) {
            this.versionStore.saveCurrentVersion()
            return
        }

        if (this.compareVersion(savedVersion, this.currentVersion) < 0) {
            this.versionStore.setPreviousVersion(savedVersion)
            this.versionStore.setShouldShowChangelog(true)
            this.versionStore.saveCurrentVersion()
        }
    }

    acknowledgeChangelog() {
        this.versionStore.setShouldShowChangelog(false)
    }

    private compareVersion(version1: string, version2: string): number {
        const semver1 = this.parseSemver(version1)
        const semver2 = this.parseSemver(version2)

        if (semver1.major !== semver2.major) {
            return semver1.major > semver2.major ? 1 : -1
        }
        if (semver1.minor !== semver2.minor) {
            return semver1.minor > semver2.minor ? 1 : -1
        }
        if (semver1.patch !== semver2.patch) {
            return semver1.patch > semver2.patch ? 1 : -1
        }
        return 0
    }

    private parseSemver(semverString: string) {
        const semverArray = semverString.split(".")
        return {
            major: Number.parseInt(semverArray[0]) || 0,
            minor: Number.parseInt(semverArray[1]) || 0,
            patch: Number.parseInt(semverArray[2]) || 0
        }
    }
}
