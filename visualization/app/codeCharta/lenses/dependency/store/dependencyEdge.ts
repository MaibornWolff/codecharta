import { Edge } from "../../../model/codeCharta.model"

/** DependaCharta's four edge types. A pure function of the two flags an edge carries, so it is derived
 * where it is consumed and never stored. */
export type DependencyEdgeType = "regular" | "cyclic" | "feedbackContainerLevel" | "feedbackLeafLevel"

/** The edge metric the dependency parser writes. `edges` is shared with every edge producer, so only an edge
 * carrying it is a dependency, and its cycle and upward flags describe the dependency graph alone. */
const DEPENDENCIES_EDGE_METRIC = "dependencies"

export function dependencyEdgeTypeOf({
    isCyclic = false,
    isPointingUpwards = false
}: Pick<Edge, "isCyclic" | "isPointingUpwards">): DependencyEdgeType {
    if (isPointingUpwards) {
        return isCyclic ? "feedbackLeafLevel" : "feedbackContainerLevel"
    }
    return isCyclic ? "cyclic" : "regular"
}

export function isDependencyEdgeMetric(edgeMetric: string | null): boolean {
    return edgeMetric === DEPENDENCIES_EDGE_METRIC
}
