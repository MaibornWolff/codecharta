import { Injectable, inject, signal } from "@angular/core"
import { clampToSidePanelWidth, SIDE_PANEL_WIDTH_PX } from "../../shared/facade"
import { ExplorerWidthRepo } from "../repos/explorerWidth.repo"

export const EXPLORER_MIN_WIDTH = SIDE_PANEL_WIDTH_PX.min
export const EXPLORER_MAX_WIDTH = SIDE_PANEL_WIDTH_PX.max
export const EXPLORER_DEFAULT_WIDTH = SIDE_PANEL_WIDTH_PX.default

@Injectable()
export class ExplorerWidthService {
    private readonly explorerWidthRepo = inject(ExplorerWidthRepo)

    readonly width = signal(this.persistedOrDefaultWidth())

    setWidth(width: number) {
        this.width.set(clampToSidePanelWidth(width))
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
        return persistedWidth === null ? EXPLORER_DEFAULT_WIDTH : clampToSidePanelWidth(persistedWidth)
    }
}
