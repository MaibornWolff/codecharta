// v34: the dependency view is always available, so the setting that switched it on is gone
export function migrateCcStateRecordToV34<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || !("dependencyViewEnabled" in preferences)) {
        return state
    }
    const { dependencyViewEnabled: _switchedOnBefore, ...keptPreferences } = preferences as Record<string, unknown>
    return { ...record, preferences: keptPreferences } as T
}
