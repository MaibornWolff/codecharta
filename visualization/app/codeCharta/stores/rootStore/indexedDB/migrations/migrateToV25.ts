import { defaultRadialLevels } from "../../../preferences/preferences.read.facade"

// v25: preferences persisted before the radial layouts let the user pick their depth carry no level count
export function migrateCcStateRecordToV25<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "radialLevels" in preferences) {
        return state
    }
    return { ...record, preferences: { radialLevels: defaultRadialLevels, ...preferences } } as T
}
