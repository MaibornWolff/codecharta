import { Injectable, inject, signal } from "@angular/core"
import { ExplorerWidthRepo } from "../repos/explorerWidth.repo"

export const EXPLORER_MIN_WIDTH = 240
export const EXPLORER_MAX_WIDTH = 720
export const EXPLORER_DEFAULT_WIDTH = 320

export const EXPLORER_WIDTH_CSS_VARIABLE = "--cc-explorer-width"

@Injectable({ providedIn: "root" })
export class ExplorerWidthService {
    private readonly explorerWidthRepo = inject(ExplorerWidthRepo)

    readonly width = signal(this.persistedOrDefaultWidth())

    setWidth(width: number) {
        this.width.set(clampToAllowedWidth(width))
        this.persist()
    }

    reset() {
        this.width.set(EXPLORER_DEFAULT_WIDTH)
        this.persist()
    }

    private persist() {
        this.explorerWidthRepo.writeWidth(this.width())
    }

    private persistedOrDefaultWidth() {
        const persistedWidth = this.explorerWidthRepo.readWidth()
        return persistedWidth === null ? EXPLORER_DEFAULT_WIDTH : clampToAllowedWidth(persistedWidth)
    }
}

function clampToAllowedWidth(width: number) {
    return Math.min(EXPLORER_MAX_WIDTH, Math.max(EXPLORER_MIN_WIDTH, width))
}
