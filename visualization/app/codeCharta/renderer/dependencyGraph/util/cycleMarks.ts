import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { declarationPathOf } from "./boxPaths"

export interface CycleMarks {
    /** Per closed box, the cyclic dependencies between declarations that it hides an end of. */
    hiddenCyclicEdges: ReadonlyMap<string, number>
    declarationsInCycles: ReadonlySet<string>
}

export const NO_CYCLE_MARKS: CycleMarks = { hiddenCyclicEdges: new Map(), declarationsInCycles: new Set() }

/** A cyclic dependency is on screen once both of its declarations are. Until then every box standing for one
 * of them counts it, so the count leads the reader to the cycles a closed box keeps from view. */
export function findCycleMarks(leafEdges: readonly DependencyLeafEdge[], representatives: ReadonlyMap<string, string>): CycleMarks {
    const hiddenCyclicEdges = new Map<string, number>()
    const declarationsInCycles = new Set<string>()
    for (const leafEdge of leafEdges) {
        if (!leafEdge.isCyclic) {
            continue
        }
        const ends = [
            endOf(leafEdge.fromNodeName, leafEdge.fromLeaf, representatives),
            endOf(leafEdge.toNodeName, leafEdge.toLeaf, representatives)
        ]
        for (const { declarationPath } of ends) {
            declarationsInCycles.add(declarationPath)
        }
        for (const hidingBox of new Set(ends.flatMap(end => (end.hidingBox === null ? [] : [end.hidingBox])))) {
            hiddenCyclicEdges.set(hidingBox, (hiddenCyclicEdges.get(hidingBox) ?? 0) + 1)
        }
    }
    return { hiddenCyclicEdges, declarationsInCycles }
}

function endOf(filePath: string, leafKey: string, representatives: ReadonlyMap<string, string>) {
    const declarationPath = declarationPathOf(filePath, leafKey)
    const box = representatives.get(declarationPath) ?? representatives.get(filePath)
    return { declarationPath, hidingBox: box === undefined || box === declarationPath ? null : box }
}
