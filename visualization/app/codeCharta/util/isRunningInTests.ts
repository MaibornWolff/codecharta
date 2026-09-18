/** The unit tests drive their own clock, so work scheduled for a frame gap would never run there. */
export function isRunningInTests(): boolean {
    return (globalThis as unknown as { __TEST_ENVIRONMENT__?: boolean }).__TEST_ENVIRONMENT__ === true
}
