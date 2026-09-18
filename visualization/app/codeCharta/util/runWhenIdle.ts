import { isRunningInTests } from "./isRunningInTests"

/** How long a deferred save may wait for an idle moment before it is run anyway. */
const IDLE_WORK_TIMEOUT_MS = 2_000

/** Runs work the reader must not wait for in a gap between frames: a save run the moment the map turns
 * interactive is felt as a freeze right after the spinner clears. */
export function runWhenIdle(work: () => void): void {
    if (isRunningInTests() || typeof requestIdleCallback !== "function") {
        work()
        return
    }
    requestIdleCallback(() => work(), { timeout: IDLE_WORK_TIMEOUT_MS })
}
