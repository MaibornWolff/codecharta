// v16: each lens source's attributeTypes flattens to the half it owns (metrics keeps nodes, dependency keeps edges)
function unwrapAttributeTypesHalf(source: unknown, half: "nodes" | "edges"): unknown {
    if (!source || typeof source !== "object") {
        return source
    }
    const trimmed = { ...(source as Record<string, unknown>) }
    const attributeTypes = trimmed["attributeTypes"]
    if (!attributeTypes || typeof attributeTypes !== "object") {
        return trimmed
    }
    const container = attributeTypes as Record<string, unknown>
    // a flat map's values are AttributeTypeValue strings, so an object-valued `nodes`/`edges` means the legacy container
    const isLegacyContainer = typeof container["nodes"] === "object" || typeof container["edges"] === "object"
    if (isLegacyContainer) {
        trimmed["attributeTypes"] = container[half] ?? {}
    }
    return trimmed
}

export function migrateCcStateRecordToV16<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const next: Record<string, unknown> = { ...record }
    if ("metricsLensSource" in record) {
        next["metricsLensSource"] = unwrapAttributeTypesHalf(record["metricsLensSource"], "nodes")
    }
    if ("dependencyLensSource" in record) {
        next["dependencyLensSource"] = unwrapAttributeTypesHalf(record["dependencyLensSource"], "edges")
    }
    return next as T
}
