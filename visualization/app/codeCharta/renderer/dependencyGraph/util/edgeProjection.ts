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

type InsideRule = (path: string, holderPath: string) => boolean

export interface DeclarationLayer {
    declarationEdges: readonly DependencyLeafEdge[]
    hierarchy: DependencyHierarchy
    /** Whether the box at a path is drawn somewhere inside the one at another. */
    isInside: InsideRule
}

const WEIGHT_OF_AN_UNWEIGHTED_DECLARATION_EDGE = 1
const NO_DECLARATION_EDGES: readonly DependencyLeafEdge[] = []

/** The cycle and upward flags describe the dependency graph alone, so every other metric draws its edges as
 * regular ones, and only the dependencies open into the edges between declarations.
 *
 * Among folders, two files that both stay closed keep their file edge. Once one of them shows its declarations,
 * the edge gives way to the declaration edges it stands for, each still pointing upward as the file edge does:
 * the levels of the file tree say which way is up between two files, and those of the declarations only inside
 * one file. Among packages the file tree has no say: every edge is its declaration edges, flags and all.
 *
 * A dependency between two files that the map tells no file edge for is drawn all the same, on its own flags. */
export function projectEdges(
    edges: Edge[],
    representatives: ReadonlyMap<string, string>,
    edgeMetric: string | null,
    { declarationEdges: everyDeclarationEdge, hierarchy, isInside }: DeclarationLayer
): GraphEdge[] {
    const merged = new Map<string, MergedEdge>()
    const isDependencies = isDependencyEdgeMetric(edgeMetric)
    const declarationEdges = isDependencies ? everyDeclarationEdge : NO_DECLARATION_EDGES
    const declarationEdgesByFiles = groupedByFiles(declarationEdges)
    const pointsUpward = upwardRuleOf(edges, hierarchy)
    const filePairsWithAnEdge = upwardByFilePair(edges)
    for (const edge of edges) {
        const value = edgeMetric === null ? undefined : edge.attributes?.[edgeMetric]
        if (!isCarried(value)) {
            continue
        }
        const parts = declarationEdgesByFiles.get(filesKeyOf(edge.fromNodeName, edge.toNodeName)) ?? NO_DECLARATION_EDGES
        for (const part of partsOfFileEdge({ edge, weight: value, declarationEdges: parts, hierarchy, pointsUpward }, representatives)) {
            mergeInto(merged, part, isInside)
        }
    }
    const isLeftToItself = (declarationEdge: DependencyLeafEdge) =>
        isInsideOneFile(declarationEdge) || !filePairsWithAnEdge.has(filesKeyOf(declarationEdge.fromNodeName, declarationEdge.toNodeName))
    for (const declarationEdge of declarationEdges.filter(isLeftToItself)) {
        const part = {
            ...boxesOf(declarationEdge, representatives),
            ...declarationEdgePart(declarationEdge, pointsUpward(declarationEdge))
        }
        mergeInto(merged, part, isInside)
    }
    const typeOf = isDependencies ? dependencyEdgeTypeOf : () => "regular" as const
    return [...merged].map(([id, { isCyclic, isPointingUpwards, ...edge }]) => ({
        id,
        ...edge,
        type: typeOf({ isCyclic, isPointingUpwards })
    }))
}

function isInsideOneFile(declarationEdge: DependencyLeafEdge): boolean {
    return declarationEdge.fromNodeName === declarationEdge.toNodeName
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
 * inside one file or between two files without a file edge. Among packages the file tree has no say, and its
 * own flag always counts. */
export function upwardRuleOf(edges: readonly Edge[], hierarchy: DependencyHierarchy): UpwardRule {
    const upwardOfFilePair = upwardByFilePair(edges)
    return declarationEdge => {
        const isSaidByTheFiles = hierarchy !== "packages" && !isInsideOneFile(declarationEdge)
        const saidByTheFiles = isSaidByTheFiles
            ? upwardOfFilePair.get(filesKeyOf(declarationEdge.fromNodeName, declarationEdge.toNodeName))
            : undefined
        return saidByTheFiles ?? Boolean(declarationEdge.isPointingUpwards)
    }
}

function upwardByFilePair(edges: readonly Edge[]): Map<string, boolean> {
    const upwardOfFilePair = new Map<string, boolean>()
    for (const edge of edges.filter(isDependency)) {
        const filePair = filesKeyOf(edge.fromNodeName, edge.toNodeName)
        upwardOfFilePair.set(filePair, Boolean(edge.isPointingUpwards) || upwardOfFilePair.get(filePair) === true)
    }
    return upwardOfFilePair
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
    const ends = declarationEdges.map(declarationEdge => boxesOf(declarationEdge, representatives))
    const showsDeclarations = ends.some(end => end.fromPath !== fromPath || end.toPath !== toPath)
    const isDecidedByDeclarations = hierarchy === "packages" && declarationEdges.length > 0
    if (!showsDeclarations && !isDecidedByDeclarations) {
        const isPointingUpwards = Boolean(edge.isPointingUpwards)
        return [{ fromPath, toPath, weight, isCyclic: Boolean(edge.isCyclic), isPointingUpwards, declarationEdges }]
    }
    return declarationEdges.map((declarationEdge, index) => ({
        ...ends[index],
        ...declarationEdgePart(declarationEdge, pointsUpward(declarationEdge))
    }))
}

function declarationEdgePart(declarationEdge: DependencyLeafEdge, isPointingUpwards: boolean) {
    const weight = declarationEdge.attributes[DEPENDENCIES_EDGE_METRIC] ?? WEIGHT_OF_AN_UNWEIGHTED_DECLARATION_EDGE
    return { weight, isCyclic: Boolean(declarationEdge.isCyclic), isPointingUpwards, declarationEdges: [declarationEdge] }
}

/** A declaration the tree does not hold is stood for by whatever stands for its file. */
function boxesOf(declarationEdge: DependencyLeafEdge, representatives: ReadonlyMap<string, string>) {
    const boxOf = (filePath: string, leafKey: string) =>
        representatives.get(declarationPathOf(filePath, leafKey)) ?? representatives.get(filePath)
    return {
        fromPath: boxOf(declarationEdge.fromNodeName, declarationEdge.fromLeaf),
        toPath: boxOf(declarationEdge.toNodeName, declarationEdge.toLeaf)
    }
}

function mergeInto(merged: Map<string, MergedEdge>, part: EdgePart, isInside: InsideRule) {
    const { fromPath, toPath, weight, isCyclic, isPointingUpwards, declarationEdges } = part
    if (fromPath === undefined || toPath === undefined || isWithinOneBox(fromPath, toPath, isInside)) {
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
function isWithinOneBox(fromPath: string, toPath: string, isInside: InsideRule): boolean {
    return fromPath === toPath || isInside(fromPath, toPath) || isInside(toPath, fromPath)
}

function groupedByFiles(declarationEdges: readonly DependencyLeafEdge[]): Map<string, DependencyLeafEdge[]> {
    const byFiles = new Map<string, DependencyLeafEdge[]>()
    for (const declarationEdge of declarationEdges) {
        if (!isInsideOneFile(declarationEdge)) {
            addToGroup(byFiles, filesKeyOf(declarationEdge.fromNodeName, declarationEdge.toNodeName), declarationEdge)
        }
    }
    return byFiles
}

function filesKeyOf(fromFilePath: string, toFilePath: string): string {
    return `${fromFilePath}|${toFilePath}`
}
