import { Injectable, inject } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"

const EXPLORER_COLLAPSED_KEY = "codeChartaExplorerCollapsed"

@Injectable({ providedIn: "root" })
export class ExplorerCollapseRepo {
    private readonly localStorageRepo = inject(LocalStorageRepo)

    readIsCollapsed(): boolean {
        return this.localStorageRepo.read(EXPLORER_COLLAPSED_KEY) === "true"
    }

    writeIsCollapsed(isCollapsed: boolean): void {
        this.localStorageRepo.write(EXPLORER_COLLAPSED_KEY, String(isCollapsed))
    }
}
