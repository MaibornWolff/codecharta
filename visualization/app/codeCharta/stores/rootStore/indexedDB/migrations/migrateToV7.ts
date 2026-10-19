import { defaultMetricsLensSource } from "../../../metricsLensSource/metricsLensSource.read.facade"

// v7: attributeTypes + attributeDescriptors → metricsLensSource (new root; was fileSettings)
const V7_MOVES: Record<string, string[]> = {
    fileSettings: ["attributeTypes", "attributeDescriptors"]
}

export function migrateCcStateRecordToV7<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const metricsLensSource: Record<string, unknown> = {
        ...defaultMetricsLensSource,
        ...(record["metricsLensSource"] as Record<string, unknown>)
    }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V7_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                metricsLensSource[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["metricsLensSource"] = metricsLensSource
    return next as T
}
