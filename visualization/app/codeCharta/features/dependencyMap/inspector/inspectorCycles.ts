import { CycleChain, cyclesThrough } from "../declarations/cycleChains"
import { DeclarationIndex, fromPathOf, IndexedDeclaration } from "../declarations/declarationIndex"
import {
    declarationReference,
    fileReference,
    InspectorLink,
    InspectorReference,
    linkOf,
    PointsUpward,
    pathsOf
} from "./inspectorReferences"

/** A declaration a cycle runs through, and how its dependency on the next one is drawn; the last leads back to the first. */
interface InspectorCycleStep {
    reference: InspectorReference
    linkToNext: InspectorLink
}

export interface InspectorCycle {
    steps: InspectorCycleStep[]
    files: InspectorReference[]
    declarationEdges: CycleChain
}

interface CycleContext {
    index: DeclarationIndex
    cycles: readonly CycleChain[]
    rowLimit: number
    pointsUpward: PointsUpward
}

export interface InspectorCycles {
    /** The cycles running through the selection; a hub's are cut like its rows. */
    cycles: InspectorCycle[]
    cycleCount: number
}

export function cyclesOf(
    declarations: readonly IndexedDeclaration[],
    { index, cycles, rowLimit, pointsUpward }: CycleContext
): InspectorCycles {
    const ownPaths = pathsOf(declarations)
    const cyclesOfSelection = cyclesThrough(ownPaths, cycles).map((chain): InspectorCycle => {
        const walked = startingAt(chain, ownPaths)
        return {
            steps: walked.map(declarationEdge => ({
                reference: declarationReference(index.declarations.get(fromPathOf(declarationEdge))),
                linkToNext: linkOf(declarationEdge, pointsUpward)
            })),
            files: [...new Set(walked.map(declarationEdge => declarationEdge.fromNodeName))].map(fileReference),
            declarationEdges: walked
        }
    })
    return { cycleCount: cyclesOfSelection.length, cycles: cyclesOfSelection.toSorted(widestCycleFirst).slice(0, rowLimit) }
}

/** The cycle across the most files first, then the one through the most declarations: the widest tangle is the
 * one to see, and the one a cut list must not lose. */
function widestCycleFirst(cycleA: InspectorCycle, cycleB: InspectorCycle): number {
    return (
        cycleB.files.length - cycleA.files.length ||
        cycleB.steps.length - cycleA.steps.length ||
        cycleA.steps[0].reference.name.localeCompare(cycleB.steps[0].reference.name)
    )
}

/** A cycle has no first declaration; it is told from one of the selection's own, since that is where the reader stands. */
function startingAt(chain: CycleChain, ownPaths: ReadonlySet<string>): CycleChain {
    const start = Math.max(
        0,
        chain.findIndex(declarationEdge => ownPaths.has(fromPathOf(declarationEdge)))
    )
    return [...chain.slice(start), ...chain.slice(0, start)]
}
