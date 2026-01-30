import packageJson from "../../../../../package.json"
import { Injectable, signal } from "@angular/core"

const LOCAL_STORAGE_KEY = "codeChartaVersion"

@Injectable({ providedIn: "root" })
export class VersionStore {
    readonly currentVersion = packageJson.version
    readonly previousVersion = signal<string | null>(null)
    readonly shouldShowChangelog = signal(false)

    getSavedVersion(): string | null {
        return localStorage.getItem(LOCAL_STORAGE_KEY)
    }

    saveCurrentVersion() {
        localStorage.setItem(LOCAL_STORAGE_KEY, this.currentVersion)
    }

    setPreviousVersion(version: string | null) {
        this.previousVersion.set(version)
    }

    setShouldShowChangelog(value: boolean) {
        this.shouldShowChangelog.set(value)
    }
}
