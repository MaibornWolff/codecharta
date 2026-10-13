import { Injectable, inject, signal } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"
import { clampToSidePanelWidth, SIDE_PANEL_WIDTH_PX } from "../util/sidePanelWidth"

export const INSPECTOR_WIDTH_KEY = "codeChartaInspectorWidth"
export const INSPECTOR_WIDTH_CSS_VARIABLE = "--cc-inspector-width"

/** One width for the inspector of every view: what lies beside an inspector, as the legend, reads it from the
 * same CSS variable the inspectors take their width from. */
@Injectable({ providedIn: "root" })
export class InspectorWidthService {
    private readonly localStorageRepo = inject(LocalStorageRepo)

    readonly width = signal(this.rememberedOrDefaultWidth())

    constructor() {
        this.publish()
    }

    /** Shown at once and remembered only on request: a drag sets a width with every move of the pointer. */
    setWidth(width: number): void {
        this.width.set(clampToSidePanelWidth(width))
        this.publish()
    }

    rememberWidth(): void {
        this.localStorageRepo.write(INSPECTOR_WIDTH_KEY, String(this.width()))
    }

    reset(): void {
        this.setWidth(SIDE_PANEL_WIDTH_PX.default)
        this.rememberWidth()
    }

    private publish(): void {
        document.documentElement.style.setProperty(INSPECTOR_WIDTH_CSS_VARIABLE, `${this.width()}px`)
    }

    private rememberedOrDefaultWidth(): number {
        const rememberedWidth = Number(this.localStorageRepo.read(INSPECTOR_WIDTH_KEY))
        return Number.isFinite(rememberedWidth) && rememberedWidth > 0
            ? clampToSidePanelWidth(rememberedWidth)
            : SIDE_PANEL_WIDTH_PX.default
    }
}
