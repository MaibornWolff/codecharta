import { isRunningInTests } from "./isRunningInTests"

/** Long enough for two frames on a busy main thread, short enough not to hold a load up noticeably. */
const PAINT_FALLBACK_MS = 250

/** Resolves once the browser has painted: the build that follows occupies the frame it would paint in. */
export function nextPaint(): Promise<void> {
    if (isRunningInTests() || typeof requestAnimationFrame !== "function") {
        return Promise.resolve()
    }
    return new Promise(resolve => {
        // A hidden tab runs no animation frame, and the upload this gates must still commit.
        const fallback = setTimeout(resolve, PAINT_FALLBACK_MS)
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                clearTimeout(fallback)
                resolve()
            })
        )
    })
}
