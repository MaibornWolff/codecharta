import { defaultSharedView } from "../../../sharedView/sharedView.read.facade"

// v6: focusedNodePath + searchPattern → sharedView (new root; was dynamicSettings)
const V6_MOVES: Record<string, string[]> = {
    dynamicSettings: ["focusedNodePath", "searchPattern"]
}

export function migrateCcStateRecordToV6<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView: Record<string, unknown> = { ...defaultSharedView, ...(record["sharedView"] as Record<string, unknown>) }
    const next: Record<string, unknown> = { ...record }
    for (const [home, keys] of Object.entries(V6_MOVES)) {
        const source = record[home]
        if (!source || typeof source !== "object") {
            continue
        }
        const trimmed = { ...(source as Record<string, unknown>) }
        for (const key of keys) {
            if (key in trimmed) {
                sharedView[key] = trimmed[key]
                delete trimmed[key]
            }
        }
        next[home] = trimmed
    }
    next["sharedView"] = sharedView
    return next as T
}
