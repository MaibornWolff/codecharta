import { isRunningInTests } from "./isRunningInTests"

/** Long enough for two frames on a busy main thread, short enough not to hold a load up noticeably. */
const PAINT_FALLBACK_MS = 250

/**
 * Resolves once the browser has had a chance to paint. Building the map runs as one synchronous block,
 * so a phase set right before it would never reach the screen — the frame it would have been painted in
 * is the frame the work occupies.
 */
export function nextPaint(): Promise<void> {
    if (isRunningInTests() || typeof requestAnimationFrame !== "function") {
        return Promise.resolve()
    }
    return new Promise(resolve => {
        // A hidden tab runs no animation frame at all, and the upload this gates must still commit -
        // a tab that is not painting has no frame to miss anyway.
        const fallback = setTimeout(resolve, PAINT_FALLBACK_MS)
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                clearTimeout(fallback)
                resolve()
            })
        )
    })
}
