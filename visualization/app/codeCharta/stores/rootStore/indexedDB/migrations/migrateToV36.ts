import { defaultLocalSourceEnabled } from "../../../preferences/preferences.read.facade"

// v36: preferences persisted before local source files could be opened carry no switch for it
export function migrateCcStateRecordToV36<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "localSourceEnabled" in preferences) {
        return state
    }
    return { ...record, preferences: { ...preferences, localSourceEnabled: defaultLocalSourceEnabled } } as T
}
