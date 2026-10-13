import { Injectable, inject, signal } from "@angular/core"
import { LocalStorageRepo } from "../../../util/persistence/localStorage.repo"

export const INSPECTOR_MIN_WIDTH = 240
export const INSPECTOR_MAX_WIDTH = 720
export const INSPECTOR_DEFAULT_WIDTH = 320
export const INSPECTOR_WIDTH_KEY = "codeChartaInspectorWidth"
export const INSPECTOR_WIDTH_CSS_VARIABLE = "--cc-inspector-width"

/** One width for the inspector of every view: what lies beside an inspector, as the legend, reads it from the
 * same CSS variable the inspectors take their width from. */
@Injectable({ providedIn: "root" })
export class InspectorWidthService {
    private readonly localStorageRepo = inject(LocalStorageRepo)

    readonly width = signal(this.persistedOrDefaultWidth())

    constructor() {
        this.publish()
    }

    setWidth(width: number): void {
        this.width.set(clampToAllowedWidth(width))
        this.persistAndPublish()
    }

    reset(): void {
        this.width.set(INSPECTOR_DEFAULT_WIDTH)
        this.persistAndPublish()
    }

    private persistAndPublish(): void {
        this.localStorageRepo.write(INSPECTOR_WIDTH_KEY, String(this.width()))
        this.publish()
    }

    private publish(): void {
        document.documentElement.style.setProperty(INSPECTOR_WIDTH_CSS_VARIABLE, `${this.width()}px`)
    }

    private persistedOrDefaultWidth(): number {
        const persistedWidth = Number(this.localStorageRepo.read(INSPECTOR_WIDTH_KEY))
        return Number.isFinite(persistedWidth) && persistedWidth > 0 ? clampToAllowedWidth(persistedWidth) : INSPECTOR_DEFAULT_WIDTH
    }
}

function clampToAllowedWidth(width: number): number {
    return Math.min(INSPECTOR_MAX_WIDTH, Math.max(INSPECTOR_MIN_WIDTH, width))
}
