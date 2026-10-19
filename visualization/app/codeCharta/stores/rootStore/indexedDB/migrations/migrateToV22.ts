/**
 * v22: the one blacklist, whose entries said what they did, becomes the two lists the app now keeps
 * them in. Exclusion decides which nodes the map holds; flattening only changes how a subtree looks.
 */
export function migrateCcStateRecordToV22<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const sharedView = record["sharedView"]
    if (!sharedView || typeof sharedView !== "object" || !("blacklist" in sharedView)) {
        return state
    }
    const { blacklist, ...sharedViewWithoutBlacklist } = sharedView as Record<string, unknown>
    const nodeRules = Array.isArray(blacklist) ? (blacklist as { path: string; type?: string; nodeType?: string }[]) : []
    const withoutEffect = ({ path, nodeType }: { path: string; nodeType?: string }) => (nodeType ? { path, nodeType } : { path })

    return {
        ...record,
        sharedView: {
            ...sharedViewWithoutBlacklist,
            excludedNodes: nodeRules.filter(rule => rule.type !== "flatten").map(withoutEffect),
            flattenedNodes: nodeRules.filter(rule => rule.type === "flatten").map(withoutEffect)
        }
    } as T
}
