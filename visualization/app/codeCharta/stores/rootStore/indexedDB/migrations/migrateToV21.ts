import { defaultCenterMapZoom } from "../../../preferences/preferences.read.facade"

// v21: preferences persisted before the centre-map zoom was configurable carry no centerMapZoom
export function migrateCcStateRecordToV21<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"]
    if (!preferences || typeof preferences !== "object" || "centerMapZoom" in preferences) {
        return state
    }
    return { ...record, preferences: { ...preferences, centerMapZoom: defaultCenterMapZoom } } as T
}
