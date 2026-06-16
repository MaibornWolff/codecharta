import { Injectable, signal } from "@angular/core"

export const EXPLORER_MIN_WIDTH = 240
export const EXPLORER_MAX_WIDTH = 720
export const EXPLORER_DEFAULT_WIDTH = 320
export const EXPLORER_COLLAPSED_WIDTH = 288

@Injectable({ providedIn: "root" })
export class ExplorerWidthService {
    readonly width = signal(EXPLORER_DEFAULT_WIDTH)

    setWidth(width: number) {
        this.width.set(clamp(width, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH))
    }

    reset() {
        this.width.set(EXPLORER_DEFAULT_WIDTH)
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
