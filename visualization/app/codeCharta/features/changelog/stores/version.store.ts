import { Injectable, inject, signal } from "@angular/core"
import packageJson from "../../../../../package.json"
import { VersionRepo } from "../repos/version.repo"

@Injectable({ providedIn: "root" })
export class VersionStore {
    private readonly versionRepo = inject(VersionRepo)

    readonly currentVersion = packageJson.version
    readonly previousVersion = signal<string | null>(null)
    readonly shouldShowChangelog = signal(false)

    getSavedVersion(): string | null {
        return this.versionRepo.readSavedVersion()
    }

    saveCurrentVersion() {
        this.versionRepo.writeSavedVersion(this.currentVersion)
    }

    setPreviousVersion(version: string | null) {
        this.previousVersion.set(version)
    }

    setShouldShowChangelog(value: boolean) {
        this.shouldShowChangelog.set(value)
    }
}
