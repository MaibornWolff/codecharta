import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DeclarationIndex, fromPathOf, toPathOf } from "./declarationIndex"

/** A cycle as the dependencies that close it, in the order they are walked: each ends where the next starts,
 * and the last ends where the first started. */
export type CycleChain = readonly DependencyLeafEdge[]

export interface CycleSearchLimits {
    /** The search ends once it has found this many cycles. */
    maxChains: number
    /** How many ways around are tried in all: a hub in a large tangle would otherwise be walked for seconds. */
    maxWalks: number
}

const CYCLE_SEARCH_LIMITS: CycleSearchLimits = { maxChains: 12, maxWalks: 300 }

/** The shortest way back for every cyclic dependency leaving one of the given declarations. Only dependencies
 * the parser marked cyclic are walked, so the search never leaves the strongly connected part it starts in. */
export function findCycleChains(
    declarationPaths: readonly string[],
    index: DeclarationIndex,
    { maxChains, maxWalks }: CycleSearchLimits = CYCLE_SEARCH_LIMITS
): CycleChain[] {
    const chains = new Map<string, CycleChain>()
    let walks = 0
    for (const start of declarationPaths) {
        for (const firstStep of cyclicFrom(start, index)) {
            if (chains.size >= maxChains || walks >= maxWalks) {
                return [...chains.values()]
            }
            walks++
            const wayBack = shortestWay(toPathOf(firstStep), start, index)
            if (wayBack !== null) {
                const chain = [firstStep, ...wayBack]
                const identity = identityOf(chain)
                chains.set(identity, chains.get(identity) ?? chain)
            }
        }
    }
    return [...chains.values()]
}

function cyclicFrom(declarationPath: string, index: DeclarationIndex): DependencyLeafEdge[] {
    return (index.outgoing.get(declarationPath) ?? []).filter(leafEdge => leafEdge.isCyclic)
}

function shortestWay(from: string, to: string, index: DeclarationIndex): DependencyLeafEdge[] | null {
    const stepInto = new Map<string, DependencyLeafEdge | null>([[from, null]])
    const queue = [from]
    for (let position = 0; position < queue.length && !stepInto.has(to); position++) {
        for (const leafEdge of cyclicFrom(queue[position], index)) {
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
