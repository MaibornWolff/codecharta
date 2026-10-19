import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"

// v26: preferences persisted before the dependency bar kept its settings carry none of them
export function migrateCcStateRecordToV26<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "dependencyGraph" in preferences) {
        return state
    }
    return { ...record, preferences: { dependencyGraph: defaultDependencyGraphSettings, ...preferences } } as T
}
