import { defaultDependencyLensSource } from "../../../dependencyLensSource/dependencyLensSource.read.facade"

// v13: edge attributeTypes → dependencyLensSource (new root; was metricsLensSource.attributeTypes.edges)
export function migrateCcStateRecordToV13<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const dependencyLensSource: Record<string, unknown> = {
        ...defaultDependencyLensSource,
        ...(record["dependencyLensSource"] as Record<string, unknown>)
    }
    const next: Record<string, unknown> = { ...record }
    const metricsLensSource = record["metricsLensSource"]
    if (metricsLensSource && typeof metricsLensSource === "object") {
        const trimmed = { ...(metricsLensSource as Record<string, unknown>) }
        const attributeTypes = trimmed["attributeTypes"]
        if (attributeTypes && typeof attributeTypes === "object") {
            const { nodes, edges } = attributeTypes as { nodes?: unknown; edges?: unknown }
            dependencyLensSource["attributeTypes"] = { nodes: {}, edges: edges ?? {} }
            trimmed["attributeTypes"] = { nodes: nodes ?? {}, edges: {} }
        }
        next["metricsLensSource"] = trimmed
    }
    next["dependencyLensSource"] = dependencyLensSource
    return next as T
}
