import { DependencyEdgeType, dependencyEdgeTypeOf, isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { Edge } from "../../../model/codeCharta.model"
import { LeveledNode } from "./leveledTree"

/** A file edge lifted onto the boxes on screen. Edges landing on the same two boxes merge: their
 * dependencies add up, and a merged edge is cyclic or points upward when any of its parts does. */
export interface GraphEdge {
    id: string
    fromPath: string
    toPath: string
    weight: number
    type: DependencyEdgeType
}

/** An edge without the metric, or at zero, stands for nothing of it. */
function isCarried(value: unknown): value is number {
    return typeof value === "number" && value > 0
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

/** The edges carrying the metric, merged onto the boxes on screen and weighted by its value. The cycle and upward
 * flags describe the dependency graph alone, so every other metric draws its edges as regular ones. */
export function projectEdges(edges: Edge[], representatives: ReadonlyMap<string, string>, edgeMetric: string | null): GraphEdge[] {
    const merged = new Map<string, MergedEdge>()
    for (const edge of edges) {
        const value = edgeMetric === null ? undefined : edge.attributes?.[edgeMetric]
        const fromPath = representatives.get(edge.fromNodeName)
        const toPath = representatives.get(edge.toNodeName)
        if (!isCarried(value) || fromPath === undefined || toPath === undefined || fromPath === toPath) {
            continue
        }
        const id = `${fromPath}|${toPath}`
        const existing = merged.get(id) ?? { fromPath, toPath, weight: 0, isCyclic: false, isPointingUpwards: false }
        merged.set(id, {
            fromPath,
            toPath,
            weight: existing.weight + value,
            isCyclic: existing.isCyclic || Boolean(edge.isCyclic),
            isPointingUpwards: existing.isPointingUpwards || Boolean(edge.isPointingUpwards)
        })
    }
    const typeOf = isDependencyEdgeMetric(edgeMetric) ? dependencyEdgeTypeOf : () => "regular" as const
    return [...merged].map(([id, edge]) => ({ id, fromPath: edge.fromPath, toPath: edge.toPath, weight: edge.weight, type: typeOf(edge) }))
}
