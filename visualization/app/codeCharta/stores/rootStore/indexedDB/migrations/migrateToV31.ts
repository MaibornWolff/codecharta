const EDGE_DRAWING_BY_REMOVED_STYLE: Record<string, { edgeStyle: string; edgeShape: string }> = {
    curved: { edgeStyle: "combined", edgeShape: "curved" },
    upwardAside: { edgeStyle: "aside", edgeShape: "curved" },
    straight: { edgeStyle: "spread", edgeShape: "straight" }
}
const STRAIGHT_FROM_THE_MIDDLE = { edgeStyle: "combined", edgeShape: "straight" }

// v31: curved and straight left the edge styles of the dependency graph to become its line shape
export function migrateCcStateRecordToV31<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"] as Record<string, unknown> | undefined
    const dependencyGraph = preferences?.["dependencyGraph"] as Record<string, unknown> | undefined
    if (!dependencyGraph || typeof dependencyGraph !== "object") {
        return state
    }
    const drawing = edgeDrawingOfToday(dependencyGraph)
    if (!drawing) {
        return state
    }
    return { ...record, preferences: { ...preferences, dependencyGraph: { ...dependencyGraph, ...drawing } } } as T
}

function edgeDrawingOfToday(dependencyGraph: Record<string, unknown>): Record<string, string> | null {
    const persistedStyle = dependencyGraph["edgeStyle"]
    const removedStyle = typeof persistedStyle === "string" ? persistedStyle : ""
    if (removedStyle === "straight" && dependencyGraph["isAnchoredAtSideMiddle"] === true) {
        return STRAIGHT_FROM_THE_MIDDLE
    }
    if (removedStyle in EDGE_DRAWING_BY_REMOVED_STYLE) {
        return EDGE_DRAWING_BY_REMOVED_STYLE[removedStyle]
    }
    return "edgeShape" in dependencyGraph ? null : { edgeShape: "curved" }
}
