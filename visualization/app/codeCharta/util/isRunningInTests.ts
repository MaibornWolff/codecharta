/**
 * Work scheduled for a frame gap or a paint never runs under the unit tests, which drive their own
 * clock — so the schedulers run it straight away there instead of dropping it.
 */
export function isRunningInTests(): boolean {
    return (globalThis as unknown as { __TEST_ENVIRONMENT__?: boolean }).__TEST_ENVIRONMENT__ === true
}
