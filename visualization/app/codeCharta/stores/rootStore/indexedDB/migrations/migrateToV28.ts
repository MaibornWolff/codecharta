const DEPENDENCY_VIEW_ENABLED_OF_V28 = false

// v28: preferences persisted before the dependency view could be switched on carry no such setting
export function migrateCcStateRecordToV28<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "dependencyViewEnabled" in preferences) {
        return state
    }
    return { ...record, preferences: { dependencyViewEnabled: DEPENDENCY_VIEW_ENABLED_OF_V28, ...preferences } } as T
}
