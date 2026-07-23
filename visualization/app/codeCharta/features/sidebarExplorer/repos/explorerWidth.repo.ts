import { Injectable, inject } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"

const EXPLORER_WIDTH_KEY = "codeChartaExplorerWidth"

@Injectable({ providedIn: "root" })
export class ExplorerWidthRepo {
    private readonly localStorageRepo = inject(LocalStorageRepo)

    readWidth(): number | null {
        const persistedWidth = Number(this.localStorageRepo.read(EXPLORER_WIDTH_KEY))
        if (!Number.isFinite(persistedWidth) || persistedWidth === 0) {
            return null
        }
        return persistedWidth
    }

    writeWidth(width: number): void {
        this.localStorageRepo.write(EXPLORER_WIDTH_KEY, String(width))
    }
}
