import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { declarationPathOf } from "./boxPaths"
import { boxesOf, UpwardRule } from "./edgeProjection"

/** Per box, the upward dependencies between declarations it hides. */
export type UpwardMarks = ReadonlyMap<string, number>

export const NO_UPWARD_MARKS: UpwardMarks = new Map()

/** A dependency is hidden in a box that stands for both of its ends. A declaration drawn as itself hides nothing,
 * so an opened file counts none of the dependencies between its declarations. */
export function findUpwardMarks(
    declarationEdges: readonly DependencyLeafEdge[],
    representatives: ReadonlyMap<string, string>,
    pointsUpward: UpwardRule
): UpwardMarks {
    const upwardMarks = new Map<string, number>()
    for (const declarationEdge of declarationEdges.filter(pointsUpward)) {
        const { fromPath, toPath } = boxesOf(declarationEdge, representatives)
        const isDrawnAsItself = fromPath === declarationPathOf(declarationEdge.fromNodeName, declarationEdge.fromLeaf)
        if (fromPath !== undefined && fromPath === toPath && !isDrawnAsItself) {
            upwardMarks.set(fromPath, (upwardMarks.get(fromPath) ?? 0) + 1)
        }
    }
    return upwardMarks
}
