import { Injectable, inject } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"

const VERSION_KEY = "codeChartaVersion"

@Injectable({ providedIn: "root" })
export class VersionRepo {
    private readonly localStorageRepo = inject(LocalStorageRepo)

    readSavedVersion(): string | null {
        return this.localStorageRepo.read(VERSION_KEY)
    }

    writeSavedVersion(version: string): void {
        this.localStorageRepo.write(VERSION_KEY, version)
    }
}
