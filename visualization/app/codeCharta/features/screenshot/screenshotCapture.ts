import { InjectionToken, Signal } from "@angular/core"

/**
 * What a view offers the screenshot button. Each view captures something different — the metrics view
 * rasterizes the 3D map and its overlays, the domain view exports the word-cloud canvas — but the
 * delivery (file vs. clipboard), the hotkeys and the button itself are shared, so the button depends on
 * this seam instead of on a concrete service.
 */
export interface ScreenshotCapture {
    /** Whether the browser can write an image to the clipboard at all (Firefox cannot). */
    readonly isWriteToClipboardAllowed: boolean

    /** What the screenshot shows, as the tooltip's noun: "a screenshot of the <subject>". */
    readonly subject: string

    /** False while there is nothing to capture, e.g. the word cloud's empty state. */
    readonly isCaptureAvailable: Signal<boolean>

    makeScreenshotToFile(): Promise<void>

    makeScreenshotToClipboard(): Promise<void>
}

export const SCREENSHOT_CAPTURE = new InjectionToken<ScreenshotCapture>("SCREENSHOT_CAPTURE")
