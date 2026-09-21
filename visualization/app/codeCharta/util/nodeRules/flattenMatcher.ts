import { FlattenedNode } from "../../model/codeCharta.model"
import { buildRuleEngines, transformPath } from "./gitignorePattern"

export interface FlattenMatcher {
    /** Flattening applies to any node, leaf or folder. */
    isFlattened(path: string): boolean
}

/**
 * The single engine for flatten rules. Unlike exclusion this is consulted while the map is laid
 * out, not while it is decorated: flattening changes how a subtree looks, never which nodes exist.
 */
export function createFlattenMatcher(flattenedNodes: FlattenedNode[]): FlattenMatcher {
    const { matchesTransformed } = buildRuleEngines(flattenedNodes)

    return {
        isFlattened: path => matchesTransformed(transformPath(path))
    }
}
