import { Edge } from "../../../model/codeCharta.model"
import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType } from "../../../model/dependencyGraph.model"

export type { DependencyEdgeType }
export { DEPENDENCY_EDGE_TYPES }

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

/** Another metric has no cycles or upward edges, so all of its edges are regular ones. */
export function edgeTypesCarriedBy(edgeMetric: string | null): readonly DependencyEdgeType[] {
    return isDependencyEdgeMetric(edgeMetric) ? DEPENDENCY_EDGE_TYPES : ["regular"]
}
