import { defaultMapState } from "../../../mapState/mapState.read.facade"

// v5: metric selection (areaMetric/heightMetric/colorMetric/edgeMetric/distributionMetric) → mapState
const V5_MOVES: Record<string, string[]> = {
    dynamicSettings: ["areaMetric", "heightMetric", "colorMetric", "edgeMetric", "distributionMetric"]
}

export function migrateCcStateRecordToV5<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const mapState: Record<string, unknown> = { ...defaultMapState, ...(record["mapState"] as Record<string, unknown>) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V5_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                mapState[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["mapState"] = mapState
    return next as T
}
