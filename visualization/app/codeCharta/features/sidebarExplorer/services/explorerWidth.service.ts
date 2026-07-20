import { Injectable, signal } from "@angular/core"

export const EXPLORER_MIN_WIDTH = 240
export const EXPLORER_MAX_WIDTH = 720
export const EXPLORER_DEFAULT_WIDTH = 320

const LOCAL_STORAGE_KEY = "codeChartaExplorerWidth"

@Injectable({ providedIn: "root" })
export class ExplorerWidthService {
    readonly width = signal(readPersistedWidth())

    setWidth(width: number) {
        this.width.set(clamp(width, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH))
        this.persist()
    }

    reset() {
        this.width.set(EXPLORER_DEFAULT_WIDTH)
        this.persist()
    }

    private persist() {
        localStorage.setItem(LOCAL_STORAGE_KEY, String(this.width()))
    }
}

function readPersistedWidth() {
    const persisted = Number(localStorage.getItem(LOCAL_STORAGE_KEY))
    if (!Number.isFinite(persisted) || persisted === 0) {
        return EXPLORER_DEFAULT_WIDTH
    }
    return clamp(persisted, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH)
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
