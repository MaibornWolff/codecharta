import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"

// v20: a sharedView persisted before metric rules carries no metricRules
export function migrateCcStateRecordToV20<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView = record["sharedView"]
    if (!sharedView || typeof sharedView !== "object" || "metricRules" in sharedView) {
        return state
    }
    return { ...record, sharedView: { ...sharedView, metricRules: defaultSharedView.metricRules } } as T
}
