import { isPersistedRecord } from "./persistedRecord"

type BlacklistEntry = { path: string; type?: string; nodeType?: string }

/**
 * v22: the one blacklist, whose entries said what they did, becomes the two lists the app now keeps
 * them in. Exclusion decides which nodes the map holds; flattening only changes how a subtree looks.
 */
export function migrateCcStateRecordToV22<T>(state: T): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const sharedView = state["sharedView"]
    if (!isPersistedRecord(sharedView) || !("blacklist" in sharedView)) {
        return state
    }
    const { blacklist, ...sharedViewWithoutBlacklist } = sharedView
    const nodeRules = Array.isArray(blacklist) ? (blacklist as BlacklistEntry[]) : []

    return {
        ...state,
        sharedView: {
            ...sharedViewWithoutBlacklist,
            excludedNodes: nodeRules.filter(rule => rule.type !== "flatten").map(withoutEffect),
            flattenedNodes: nodeRules.filter(rule => rule.type === "flatten").map(withoutEffect)
        }
    } as T
}

function withoutEffect({ path, nodeType }: BlacklistEntry) {
    return nodeType ? { path, nodeType } : { path }
}
