import { DEPENDENCIES_EDGE_METRIC, dependencyEdgeTypeOf, isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge, Edge } from "../../../model/codeCharta.model"
import { DependencyEdgeType, DependencyHierarchy } from "../../../model/dependencyGraph.model"
import { declarationPathOf } from "./boxPaths"
import { addToGroup } from "./collections"
import { LeveledNode } from "./leveledTree"

/** An edge lifted onto the boxes on screen. Edges landing on the same two boxes merge: their dependencies add
 * up, and a merged edge is cyclic or points upward when any of its parts does. */
export interface GraphEdge {
    id: string
    fromPath: string
    toPath: string
    weight: number
    type: DependencyEdgeType
    /** The dependencies between declarations the edge stands for; none for a map without declarations. */
    declarationEdges: readonly DependencyLeafEdge[]
}

export function edgeIdOf(fromPath: string, toPath: string): string {
    return `${fromPath}|${toPath}`
}

function isCarried(value: unknown): value is number {
    return typeof value === "number" && value > 0
}

export function visibleRepresentatives(tree: LeveledNode, expandedPaths: ReadonlySet<string>): Map<string, string> {
    const representatives = new Map<string, string>()
    const visit = (node: LeveledNode, hiddenIn: string | null) => {
        const representative = hiddenIn ?? node.path
        for (const path of [...(node.foldedPaths ?? []), node.path]) {
            representatives.set(path, representative)
        }
        const hidesChildren = hiddenIn !== null || !expandedPaths.has(node.path)
        for (const child of node.children) {
            visit(child, hidesChildren ? representative : null)
        }
    }
    visit(tree, null)
    return representatives
}

interface Flags {
    isCyclic: boolean
    isPointingUpwards: boolean
}

interface EdgePart extends Flags {
    fromPath: string | undefined
    toPath: string | undefined
    weight: number
    declarationEdges: readonly DependencyLeafEdge[]
}

interface MergedEdge extends Flags {
    fromPath: string
    toPath: string
    weight: number
    declarationEdges: DependencyLeafEdge[]
}

/** The dependencies between declarations, and the hierarchy they are lifted into. */
export interface DeclarationLayer {
    leafEdges: readonly DependencyLeafEdge[]
    hierarchy: DependencyHierarchy
}

const WEIGHT_OF_AN_UNWEIGHTED_LEAF_EDGE = 1
const NO_LEAF_EDGES: readonly DependencyLeafEdge[] = []

/** The cycle and upward flags describe the dependency graph alone, so every other metric draws its edges as
 * regular ones, and only the dependencies open into the edges between declarations.
 *
 * Among folders, two files that both stay closed keep their file edge. Once one of them shows its declarations,
 * the edge gives way to the declaration edges it stands for, each still pointing upward as the file edge does:
 * the levels of the file tree say which way is up between two files, and those of the declarations only inside
 * one file. Among packages the file tree has no say: every edge is its declaration edges, flags and all. */
export function projectEdges(
    edges: Edge[],
    representatives: ReadonlyMap<string, string>,
    edgeMetric: string | null,
    { leafEdges, hierarchy }: DeclarationLayer
): GraphEdge[] {
    const merged = new Map<string, MergedEdge>()
    const isDependencies = isDependencyEdgeMetric(edgeMetric)
    const declarationEdges = isDependencies ? leafEdges : NO_LEAF_EDGES
    const declarationEdgesByFiles = groupedByFiles(declarationEdges)
    const pointsUpward = upwardRuleOf(edges, hierarchy)
    for (const edge of edges) {
        const value = edgeMetric === null ? undefined : edge.attributes?.[edgeMetric]
        if (!isCarried(value)) {
            continue
        }
        const parts = declarationEdgesByFiles.get(filesKeyOf(edge.fromNodeName, edge.toNodeName)) ?? NO_LEAF_EDGES
        for (const part of partsOfFileEdge({ edge, weight: value, declarationEdges: parts, hierarchy, pointsUpward }, representatives)) {
            mergeInto(merged, part)
        }
    }
    for (const leafEdge of declarationEdges.filter(isInsideOneFile)) {
        mergeInto(merged, { ...boxesOf(leafEdge, representatives), ...leafEdgePart(leafEdge, pointsUpward(leafEdge)) })
    }
    const typeOf = isDependencies ? dependencyEdgeTypeOf : () => "regular" as const
    return [...merged].map(([id, { isCyclic, isPointingUpwards, ...edge }]) => ({
        id,
        ...edge,
        type: typeOf({ isCyclic, isPointingUpwards })
    }))
}

function isInsideOneFile(leafEdge: DependencyLeafEdge): boolean {
    return leafEdge.fromNodeName === leafEdge.toNodeName
}

interface FileEdge {
    edge: Edge
    weight: number
    declarationEdges: readonly DependencyLeafEdge[]
    hierarchy: DependencyHierarchy
    pointsUpward: UpwardRule
}

type UpwardRule = (declarationEdge: DependencyLeafEdge) => boolean

/** Which way is up for a dependency between declarations. Among folders the levels of the file tree say so
 * between two files, so the dependency points upward when their file edge does, and its own flag counts only
 * inside one file. Among packages the file tree has no say, and its own flag always counts. */
export function upwardRuleOf(edges: readonly Edge[], hierarchy: DependencyHierarchy): UpwardRule {
    const upwardFilePairs = new Set(
        edges.flatMap(edge => (edge.isPointingUpwards && isDependency(edge) ? [filesKeyOf(edge.fromNodeName, edge.toNodeName)] : []))
    )
    return declarationEdge =>
        hierarchy === "packages" || isInsideOneFile(declarationEdge)
            ? Boolean(declarationEdge.isPointingUpwards)
            : upwardFilePairs.has(filesKeyOf(declarationEdge.fromNodeName, declarationEdge.toNodeName))
}

function isDependency(edge: Edge): boolean {
    return isCarried(edge.attributes?.[DEPENDENCIES_EDGE_METRIC])
}

function partsOfFileEdge(
    { edge, weight, declarationEdges, hierarchy, pointsUpward }: FileEdge,
    representatives: ReadonlyMap<string, string>
): EdgePart[] {
    const fromPath = representatives.get(edge.fromNodeName)
    const toPath = representatives.get(edge.toNodeName)
    const ends = declarationEdges.map(leafEdge => boxesOf(leafEdge, representatives))
    const showsDeclarations = ends.some(end => end.fromPath !== fromPath || end.toPath !== toPath)
    const isDecidedByDeclarations = hierarchy === "packages" && declarationEdges.length > 0
    if (!showsDeclarations && !isDecidedByDeclarations) {
        const isPointingUpwards = Boolean(edge.isPointingUpwards)
        return [{ fromPath, toPath, weight, isCyclic: Boolean(edge.isCyclic), isPointingUpwards, declarationEdges }]
    }
    return declarationEdges.map((leafEdge, index) => ({ ...ends[index], ...leafEdgePart(leafEdge, pointsUpward(leafEdge)) }))
}

function leafEdgePart(leafEdge: DependencyLeafEdge, isPointingUpwards: boolean) {
    const weight = leafEdge.attributes[DEPENDENCIES_EDGE_METRIC] ?? WEIGHT_OF_AN_UNWEIGHTED_LEAF_EDGE
    return { weight, isCyclic: Boolean(leafEdge.isCyclic), isPointingUpwards, declarationEdges: [leafEdge] }
}

/** A declaration the tree does not hold is stood for by whatever stands for its file. */
function boxesOf(leafEdge: DependencyLeafEdge, representatives: ReadonlyMap<string, string>) {
    const boxOf = (filePath: string, leafKey: string) =>
        representatives.get(declarationPathOf(filePath, leafKey)) ?? representatives.get(filePath)
    return { fromPath: boxOf(leafEdge.fromNodeName, leafEdge.fromLeaf), toPath: boxOf(leafEdge.toNodeName, leafEdge.toLeaf) }
}

function mergeInto(merged: Map<string, MergedEdge>, { fromPath, toPath, weight, isCyclic, isPointingUpwards, declarationEdges }: EdgePart) {
    if (fromPath === undefined || toPath === undefined || fromPath === toPath || isHeldBy(fromPath, toPath) || isHeldBy(toPath, fromPath)) {
        return
    }
    const id = edgeIdOf(fromPath, toPath)
    const existing = merged.get(id)
    if (existing === undefined) {
        merged.set(id, { fromPath, toPath, weight, isCyclic, isPointingUpwards, declarationEdges: [...declarationEdges] })
        return
    }
    existing.weight += weight
    existing.isCyclic ||= isCyclic
    existing.isPointingUpwards ||= isPointingUpwards
    existing.declarationEdges.push(...declarationEdges)
}

/** A declaration the map tells nothing about is stood for by its file, which may be the open box around the
 * edge's other end. */
function isHeldBy(path: string, holderPath: string): boolean {
    return path.startsWith(`${holderPath}/`)
}

function groupedByFiles(leafEdges: readonly DependencyLeafEdge[]): Map<string, DependencyLeafEdge[]> {
    const byFiles = new Map<string, DependencyLeafEdge[]>()
    for (const leafEdge of leafEdges) {
        if (!isInsideOneFile(leafEdge)) {
            addToGroup(byFiles, filesKeyOf(leafEdge.fromNodeName, leafEdge.toNodeName), leafEdge)
        }
    }
    return byFiles
}

function filesKeyOf(fromFilePath: string, toFilePath: string): string {
    return `${fromFilePath}|${toFilePath}`
}
