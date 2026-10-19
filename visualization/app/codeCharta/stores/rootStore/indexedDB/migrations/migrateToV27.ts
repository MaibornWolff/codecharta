// v27: a restore used to deep-merge the shown edge types into an object with numeric keys, and saved it so
export function migrateCcStateRecordToV27<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"] as Record<string, unknown> | undefined
    const dependencyGraph = preferences?.["dependencyGraph"] as Record<string, unknown> | undefined
    const shownEdgeTypes = dependencyGraph?.["shownEdgeTypes"]
    if (!shownEdgeTypes || typeof shownEdgeTypes !== "object" || Array.isArray(shownEdgeTypes)) {
        return state
    }
    const repaired = { ...dependencyGraph, shownEdgeTypes: [...new Set(Object.values(shownEdgeTypes))] }
    return { ...record, preferences: { ...preferences, dependencyGraph: repaired } } as T
}
