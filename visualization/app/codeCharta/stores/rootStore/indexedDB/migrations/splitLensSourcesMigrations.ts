import { defaultDependencyLensSource } from "../../../dependencyLensSource/dependencyLensSource.read.facade"
import { isPersistedRecord, PersistedRecord } from "./persistedRecord"

type AttributeTypesHalf = "nodes" | "edges"

// v13: edge attributeTypes → dependencyLensSource (new root; was metricsLensSource.attributeTypes.edges)
export function migrateCcStateRecordToV13<T>(state: T): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const dependencyLensSource: PersistedRecord = {
        ...defaultDependencyLensSource,
        ...(state["dependencyLensSource"] as PersistedRecord)
    }
    const next: PersistedRecord = { ...state }
    const metricsLensSource = state["metricsLensSource"]
    if (isPersistedRecord(metricsLensSource)) {
        const trimmed = { ...metricsLensSource }
        const attributeTypes = trimmed["attributeTypes"]
        if (isPersistedRecord(attributeTypes)) {
            const { nodes, edges } = attributeTypes as { nodes?: unknown; edges?: unknown }
            dependencyLensSource["attributeTypes"] = { nodes: {}, edges: edges ?? {} }
            trimmed["attributeTypes"] = { nodes: nodes ?? {}, edges: {} }
        }
        next["metricsLensSource"] = trimmed
    }
    next["dependencyLensSource"] = dependencyLensSource
    return next as T
}

// v16: each lens source's attributeTypes flattens to the half it owns (metrics keeps nodes, dependency keeps edges)
export function migrateCcStateRecordToV16<T>(state: T): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const next: PersistedRecord = { ...state }
    if ("metricsLensSource" in state) {
        next["metricsLensSource"] = unwrapAttributeTypesHalf(state["metricsLensSource"], "nodes")
    }
    if ("dependencyLensSource" in state) {
        next["dependencyLensSource"] = unwrapAttributeTypesHalf(state["dependencyLensSource"], "edges")
    }
    return next as T
}

function unwrapAttributeTypesHalf(source: unknown, half: AttributeTypesHalf): unknown {
    if (!isPersistedRecord(source)) {
        return source
    }
    const trimmed = { ...source }
    const attributeTypes = trimmed["attributeTypes"]
    if (!isPersistedRecord(attributeTypes)) {
        return trimmed
    }
    // a flat map's values are AttributeTypeValue strings, so an object-valued `nodes`/`edges` means the legacy container
    const isLegacyContainer = typeof attributeTypes["nodes"] === "object" || typeof attributeTypes["edges"] === "object"
    if (isLegacyContainer) {
        trimmed["attributeTypes"] = attributeTypes[half] ?? {}
    }
    return trimmed
}
