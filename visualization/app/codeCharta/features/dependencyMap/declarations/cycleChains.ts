import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DeclarationIndex, fromPathOf, toPathOf } from "./declarationIndex"

/** A cycle as the dependencies that close it, in the order they are walked: each ends where the next starts,
 * and the last ends where the first started. */
export type CycleChain = readonly DependencyLeafEdge[]

type CyclicSteps = ReadonlyMap<string, readonly DependencyLeafEdge[]>

/** The cycles of a map: for every dependency the parser marked cyclic, the shortest way back to where it starts,
 * each cycle told once. Only cyclic dependencies are walked, so a walk never leaves the strongly connected part
 * it starts in. A longer way round that a shorter one makes unnecessary is not told. */
export function findCycleChains(index: DeclarationIndex): CycleChain[] {
    const cyclicSteps = cyclicStepsOf(index)
    const chains = new Map<string, CycleChain>()
    for (const [start, firstSteps] of cyclicSteps) {
        for (const firstStep of firstSteps) {
            const wayBack = shortestWay(toPathOf(firstStep), start, cyclicSteps)
            if (wayBack !== null) {
                const chain = [firstStep, ...wayBack]
                const identity = identityOf(chain)
                chains.set(identity, chains.get(identity) ?? chain)
            }
        }
    }
    return [...chains.values()]
}

function cyclicStepsOf(index: DeclarationIndex): CyclicSteps {
    const cyclicSteps = new Map<string, DependencyLeafEdge[]>()
    for (const [start, declarationEdges] of index.outgoing) {
        const cyclic = declarationEdges.filter(declarationEdge => declarationEdge.isCyclic)
        if (cyclic.length > 0) {
            cyclicSteps.set(start, cyclic)
        }
    }
    return cyclicSteps
}

export function declarationsOn(chain: CycleChain): string[] {
    return chain.map(fromPathOf)
}

export function cyclesThrough(declarationPaths: ReadonlySet<string>, chains: readonly CycleChain[]): CycleChain[] {
    return chains.filter(chain => chain.some(declarationEdge => declarationPaths.has(fromPathOf(declarationEdge))))
}

function shortestWay(from: string, to: string, cyclicSteps: CyclicSteps): DependencyLeafEdge[] | null {
    const stepInto = new Map<string, DependencyLeafEdge | null>([[from, null]])
    const queue = [from]
    for (let position = 0; position < queue.length && !stepInto.has(to); position++) {
        for (const declarationEdge of cyclicSteps.get(queue[position]) ?? []) {
            const next = toPathOf(declarationEdge)
            if (!stepInto.has(next)) {
                stepInto.set(next, declarationEdge)
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
