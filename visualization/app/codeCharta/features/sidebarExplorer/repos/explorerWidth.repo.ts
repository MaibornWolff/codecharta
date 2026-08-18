import { Injectable, inject } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"
import { EXPLORER_STORAGE_SCOPE, scopedStorageKey } from "../explorerStorageScope"

// Reads fall back to the key written before the explorer state was split per view, so an existing width survives the split.
const EXPLORER_WIDTH_KEY = "codeChartaExplorerWidth"

@Injectable()
export class ExplorerWidthRepo {
    private readonly localStorageRepo = inject(LocalStorageRepo)
    private readonly storageKey = scopedStorageKey(EXPLORER_WIDTH_KEY, inject(EXPLORER_STORAGE_SCOPE))

    readWidth(): number | null {
        const storedWidth = this.localStorageRepo.read(this.storageKey) ?? this.localStorageRepo.read(EXPLORER_WIDTH_KEY)
        const persistedWidth = Number(storedWidth)
        if (!Number.isFinite(persistedWidth) || persistedWidth === 0) {
            return null
        }
        return persistedWidth
    }

    writeWidth(width: number): void {
        this.localStorageRepo.write(this.storageKey, String(width))
    }
}
