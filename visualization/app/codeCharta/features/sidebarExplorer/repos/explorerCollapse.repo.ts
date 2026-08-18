import { Injectable, inject } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"
import { EXPLORER_STORAGE_SCOPE, scopedStorageKey } from "../explorerStorageScope"

// Reads fall back to the key written before the explorer state was split per view, so an existing choice survives the split.
const EXPLORER_COLLAPSED_KEY = "codeChartaExplorerCollapsed"

@Injectable()
export class ExplorerCollapseRepo {
    private readonly localStorageRepo = inject(LocalStorageRepo)
    private readonly storageKey = scopedStorageKey(EXPLORER_COLLAPSED_KEY, inject(EXPLORER_STORAGE_SCOPE))

    readIsCollapsed(): boolean {
        const storedValue = this.localStorageRepo.read(this.storageKey) ?? this.localStorageRepo.read(EXPLORER_COLLAPSED_KEY)
        return storedValue === "true"
    }

    writeIsCollapsed(isCollapsed: boolean): void {
        this.localStorageRepo.write(this.storageKey, String(isCollapsed))
    }
}
