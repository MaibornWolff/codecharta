import { isRunningInTests } from "./isRunningInTests"

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
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
}
