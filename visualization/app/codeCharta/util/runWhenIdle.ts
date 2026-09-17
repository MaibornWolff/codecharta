import { isRunningInTests } from "./isRunningInTests"

/** How long a deferred save may wait for an idle moment before it is run anyway. */
const IDLE_WORK_TIMEOUT_MS = 2_000

/**
 * Runs work the reader must not wait for in a gap between frames. Persisting the session blocks the
 * main thread for as long as the browser needs to copy it, so running it the moment the map becomes
 * interactive is what the reader feels as a freeze right after the spinner clears.
 */
export function runWhenIdle(work: () => void): void {
    if (isRunningInTests() || typeof requestIdleCallback !== "function") {
        work()
        return
    }
    requestIdleCallback(() => work(), { timeout: IDLE_WORK_TIMEOUT_MS })
}
