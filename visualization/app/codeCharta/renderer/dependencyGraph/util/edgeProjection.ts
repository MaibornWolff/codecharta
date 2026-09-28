import { DependencyEdgeType, dependencyEdgeTypeOf, dependencyWeightOf } from "../../../lenses/dependency/dependencyLens.facade"
import { Edge } from "../../../model/codeCharta.model"
import { LeveledNode } from "./leveledTree"

export type EdgeFilter = "none" | "all" | "cycles" | "feedback"

/** A file edge lifted onto the boxes on screen. Edges landing on the same two boxes merge: their
 * dependencies add up, and a merged edge is cyclic or points upward when any of its parts does. */
export interface GraphEdge {
    id: string
    fromPath: string
    toPath: string
    weight: number
    type: DependencyEdgeType
}

const TYPES_SHOWN_BY_FILTER: Record<EdgeFilter, ReadonlySet<DependencyEdgeType>> = {
    none: new Set(),
    all: new Set(["regular", "cyclic", "feedbackContainerLevel", "feedbackLeafLevel"]),
    cycles: new Set(["cyclic", "feedbackLeafLevel"]),
    feedback: new Set(["feedbackContainerLevel", "feedbackLeafLevel"])
}

export function isShownByFilter(type: DependencyEdgeType, filter: EdgeFilter): boolean {
    return TYPES_SHOWN_BY_FILTER[filter].has(type)
}

/** Maps every path of the tree onto the box that stands for it: itself when it is on screen, else the
 * closed folder it hides in. */
export function visibleRepresentatives(tree: LeveledNode, expandedPaths: ReadonlySet<string>): Map<string, string> {
    const representatives = new Map<string, string>()
    const visit = (node: LeveledNode, hiddenIn: string | null) => {
        const representative = hiddenIn ?? node.path
        representatives.set(node.path, representative)
        const hidesChildren = hiddenIn !== null || !expandedPaths.has(node.path)
        for (const child of node.children) {
            visit(child, hidesChildren ? representative : null)
        }
    }
    visit(tree, null)
    return representatives
}

interface MergedEdge {
    fromPath: string
    toPath: string
    weight: number
    isCyclic: boolean
    isPointingUpwards: boolean
}

export function projectEdges(edges: Edge[], representatives: ReadonlyMap<string, string>): GraphEdge[] {
    const merged = new Map<string, MergedEdge>()
    for (const edge of edges) {
        const fromPath = representatives.get(edge.fromNodeName)
        const toPath = representatives.get(edge.toNodeName)
        if (fromPath === undefined || toPath === undefined || fromPath === toPath) {
            continue
        }
        const id = `${fromPath}|${toPath}`
        const existing = merged.get(id) ?? { fromPath, toPath, weight: 0, isCyclic: false, isPointingUpwards: false }
        merged.set(id, {
            fromPath,
            toPath,
            weight: existing.weight + dependencyWeightOf(edge),
            isCyclic: existing.isCyclic || Boolean(edge.isCyclic),
            isPointingUpwards: existing.isPointingUpwards || Boolean(edge.isPointingUpwards)
        })
    }
    return [...merged].map(([id, edge]) => ({
        id,
        fromPath: edge.fromPath,
        toPath: edge.toPath,
        weight: edge.weight,
        type: dependencyEdgeTypeOf(edge)
    }))
}
