import { Edge } from "../../../model/codeCharta.model"

/** DependaCharta's four edge types. A pure function of the two flags an edge carries, so it is derived
 * where it is consumed and never stored. */
export type DependencyEdgeType = "regular" | "cyclic" | "feedbackContainerLevel" | "feedbackLeafLevel"

const DEPENDENCIES_ATTRIBUTE = "dependencies"

export function dependencyEdgeTypeOf({
    isCyclic = false,
    isPointingUpwards = false
}: Pick<Edge, "isCyclic" | "isPointingUpwards">): DependencyEdgeType {
    if (isPointingUpwards) {
        return isCyclic ? "feedbackLeafLevel" : "feedbackContainerLevel"
    }
    return isCyclic ? "cyclic" : "regular"
}

/** How many declaration-level dependencies a file edge stands for. An edge written without the count
 * still is one dependency. */
export function dependencyWeightOf(edge: Pick<Edge, "attributes">): number {
    return edge.attributes[DEPENDENCIES_ATTRIBUTE] ?? 1
}
