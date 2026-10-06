import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DeclarationIndex, fromPathOf, toPathOf } from "./declarationIndex"

/** A cycle as the dependencies that close it, in the order they are walked: each ends where the next starts,
 * and the last ends where the first started. */
export type CycleChain = readonly DependencyLeafEdge[]

/** How many cyclic dependencies are walked back at most: a map tangled beyond that is not searched to its end,
 * since each walk can cross the whole tangle. */
const MAX_CYCLE_WALKS = 4000

export interface CycleSearch {
    chains: CycleChain[]
    /** False for a map so tangled that the search was stopped: there may be cycles it did not get to. */
    isComplete: boolean
}

type CyclicSteps = ReadonlyMap<string, readonly DependencyLeafEdge[]>

/** The cycles of a map: for every dependency the parser marked cyclic, the shortest way back to where it starts,
 * each cycle told once. Only cyclic dependencies are walked, so a walk never leaves the strongly connected part
 * it starts in. A longer way round that a shorter one makes unnecessary is not told. */
export function findCycleChains(index: DeclarationIndex, maxWalks = MAX_CYCLE_WALKS): CycleSearch {
    const cyclicSteps = cyclicStepsOf(index)
    const chains = new Map<string, CycleChain>()
    let walks = 0
    for (const [start, firstSteps] of cyclicSteps) {
        for (const firstStep of firstSteps) {
            if (walks >= maxWalks) {
                return { chains: [...chains.values()], isComplete: false }
            }
            walks++
            const wayBack = shortestWay(toPathOf(firstStep), start, cyclicSteps)
            if (wayBack !== null) {
                const chain = [firstStep, ...wayBack]
                const identity = identityOf(chain)
                chains.set(identity, chains.get(identity) ?? chain)
            }
        }
    }
    return { chains: [...chains.values()], isComplete: true }
}

function cyclicStepsOf(index: DeclarationIndex): CyclicSteps {
    const cyclicSteps = new Map<string, DependencyLeafEdge[]>()
    for (const [start, leafEdges] of index.outgoing) {
        const cyclic = leafEdges.filter(leafEdge => leafEdge.isCyclic)
        if (cyclic.length > 0) {
            cyclicSteps.set(start, cyclic)
        }
    }
    return cyclicSteps
}

/** The declarations a cycle runs through, in the order they are walked. */
export function declarationsOn(chain: CycleChain): string[] {
    return chain.map(fromPathOf)
}

/** The cycles that run through at least one of the given declarations. */
export function cyclesThrough(declarationPaths: ReadonlySet<string>, chains: readonly CycleChain[]): CycleChain[] {
    return chains.filter(chain => chain.some(leafEdge => declarationPaths.has(fromPathOf(leafEdge))))
}

function shortestWay(from: string, to: string, cyclicSteps: CyclicSteps): DependencyLeafEdge[] | null {
    const stepInto = new Map<string, DependencyLeafEdge | null>([[from, null]])
    const queue = [from]
    for (let position = 0; position < queue.length && !stepInto.has(to); position++) {
        for (const leafEdge of cyclicSteps.get(queue[position]) ?? []) {
            const next = toPathOf(leafEdge)
            if (!stepInto.has(next)) {
                stepInto.set(next, leafEdge)
                queue.push(next)
            }
        }
    }
    return from === to ? [] : walkedBack(stepInto, to)
}

function walkedBack(stepInto: ReadonlyMap<string, DependencyLeafEdge | null>, to: string): DependencyLeafEdge[] | null {
    if (!stepInto.has(to)) {
        return null
    }
    const way: DependencyLeafEdge[] = []
    for (let step = stepInto.get(to); step; step = stepInto.get(fromPathOf(step))) {
        way.unshift(step)
    }
    return way
}

/** The same cycle is found from each of its declarations; it is told once, whichever it was entered at. */
function identityOf(chain: CycleChain): string {
    const paths = chain.map(toPathOf)
    const first = paths.reduce((firstSoFar, path, position) => (path < paths[firstSoFar] ? position : firstSoFar), 0)
    return [...paths.slice(first), ...paths.slice(0, first)].join("|")
}
