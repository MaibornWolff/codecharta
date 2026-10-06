import { dependencyEdgeTypeOf, isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DependencyEdgeType } from "../../../model/dependencyGraph.model"
import {
    addToGroup,
    counted,
    declarationKindLabelOf,
    GraphEdge,
    isPackagePath,
    LeveledNode,
    LineStyle,
    lineStyleOfUsages,
    nameOfPath,
    usageLabelOf
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { CycleChain, cyclesThrough } from "./cycleChains"
import { DeclarationIndex, fromPathOf, IndexedDeclaration, toPathOf } from "./declarationIndex"

type PanelRefKind = "folder" | "file" | "declaration"

/** Something the panel names that the reader can go to. */
export interface PanelRef {
    path: string
    name: string
    kind: PanelRefKind
    declarationKind?: string
}

/** What stands above the name and leads there: the box around the selection. */
interface PanelParent extends PanelRef {
    shownAs: string
}

/** A short fact under the name; one about cycles is set off in the colour of the cycles. */
interface PanelBadge {
    text: string
    isAboutCycles?: boolean
}

export interface PanelDependency {
    from: PanelRef
    to: PanelRef
    /** Whether the end belongs to the selection, so the reader sees at once which way the dependency runs. */
    isFromOwn: boolean
    isToOwn: boolean
    usages: string[]
    /** The dashes and arrowhead of its strongest way of use. */
    line: LineStyle
    /** The edge type it is drawn in. */
    type: DependencyEdgeType
    leafEdge: DependencyLeafEdge
}

/** The dependencies shared with one other file, under that file's name or, without one, under a plain label. */
interface PanelGroup {
    heading: PanelRef | null
    label: string
    dependencies: PanelDependency[]
    hiddenCount: number
}

interface PanelSection {
    title: string
    count: number
    groups: PanelGroup[]
}

interface PanelDeclaration {
    ref: PanelRef
    /** Its kind and level, as far as the map tells them. */
    detail: string
}

interface PanelDeclarations {
    count: number
    items: PanelDeclaration[]
    hiddenCount: number
}

export interface PanelCycle {
    /** The declarations walked, the first of them again at the end. */
    steps: PanelRef[]
    /** The files the cycle runs through. */
    files: PanelRef[]
    /** How each step is drawn in the graph: one per dependency walked, the last leading back to the start. */
    links: PanelLink[]
    leafEdges: CycleChain
}

/** The look of an edge: the dashes and arrowhead of its strongest way of use, and the edge type it is drawn in. */
interface PanelLink {
    line: LineStyle
    type: DependencyEdgeType
}

export type PanelActionKind = "open" | "close" | "unfold"

export interface PanelModel {
    kind: PanelRefKind | "edge"
    title: string
    parent: PanelParent | null
    path: string
    /** What the copy button copies; null where there is nothing worth copying. */
    copyText: string | null
    badges: PanelBadge[]
    declarations: PanelDeclarations | null
    sections: PanelSection[]
    /** The cycles running through the selection; a hub's are cut like its rows. */
    cycles: PanelCycle[]
    cycleCount: number
    /** Whether the map is too tangled for its cycles to have been searched to the end. */
    mayMissCycles: boolean
    action: PanelActionKind | null
}

/** The parent is the box drawn around the node, which its path does not tell: a package holds files from any
 * folder, and a chain of folders is drawn as one box. */
interface BoxSubject {
    kind: "box"
    node: LeveledNode
    parent: LeveledNode | null
    isOpen: boolean
}

export type PanelSubject = BoxSubject | { kind: "edge"; edge: GraphEdge; fromName: string; toName: string }

export interface PanelContext {
    index: DeclarationIndex
    /** Every cycle of the map. */
    cycles: readonly CycleChain[]
    mayMissCycles: boolean
    edgeMetric: string | null
    /** A hub's rows are cut at this many per group and list, so the panel of a hub stays a panel. */
    rowLimit: number
    /** Whether a dependency is drawn pointing upward in the hierarchy shown: between two files the folders
     * decide that by the file edge, the packages by the dependency itself. */
    pointsUpward: (leafEdge: DependencyLeafEdge) => boolean
}

export const PANEL_ROW_LIMIT = 20

const THIS_FILE = "this file"

export function describeSubject(subject: PanelSubject, context: PanelContext): PanelModel {
    if (subject.kind === "edge") {
        return describeEdge(subject.edge, `${subject.fromName} → ${subject.toName}`, context)
    }
    return { ...describeBox(subject, context), parent: subject.parent && parentOf(subject.parent) }
}

function describeBox({ node, isOpen }: BoxSubject, context: PanelContext): PanelModel {
    switch (node.kind) {
        case "declaration":
            return describeDeclaration(node, context)
        case "file":
            return describeFile(node, isOpen, context)
        default:
            return describeFolder(node, context)
    }
}

function parentOf(node: LeveledNode): PanelParent {
    const kind = node.kind === "file" ? "file" : "folder"
    const shownAs = isPackagePath(node.path) ? `package ${node.name}` : node.path
    return { path: node.path, name: node.name, kind, shownAs }
}

function describeFile(file: LeveledNode, isOpen: boolean, context: PanelContext): PanelModel {
    const declarations = context.index.declarationsOfFile.get(file.path) ?? []
    const own = pathsOf(declarations)
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const packages = [...new Set(declarations.flatMap(({ leaf }) => (leaf.namespace === undefined ? [] : [leaf.namespace])))]
    const cycles = cyclesOf(declarations, context)
    return {
        kind: "file",
        title: file.name,
        parent: null,
        path: file.path,
        copyText: file.path,
        badges: [
            { text: "file" },
            ...packages.map(packageKey => ({ text: `package ${packageKey}` })),
            { text: counted(declarations.length, "declaration") },
            ...cycleBadge(cycles.cycleCount)
        ],
        declarations: declarationList(declarations, context.rowLimit),
        sections: [
            section(
                "Uses",
                [{ heading: null, label: THIS_FILE, leafEdges: inside }, ...groupedByFile(outgoing, edge => edge.toNodeName)],
                own,
                context
            ),
            section(
                "Used by",
                groupedByFile(incoming, edge => edge.fromNodeName),
                own,
                context
            )
        ],
        ...cycles,
        action: declarations.length === 0 ? null : isOpen ? "close" : "open"
    }
}

function describeDeclaration(node: LeveledNode, context: PanelContext): PanelModel {
    const declaration = context.index.declarations.get(node.path)
    const declarations = declaration ? [declaration] : []
    const own = pathsOf(declarations)
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const uses = [...inside.filter(edge => fromPathOf(edge) === node.path), ...outgoing]
    const usedBy = [...inside.filter(edge => toPathOf(edge) === node.path), ...incoming]
    const cycles = cyclesOf(declarations, context)
    const { namespace, level } = declaration?.leaf ?? {}
    return {
        kind: "declaration",
        title: node.name,
        parent: null,
        path: node.path,
        copyText: declaration?.filePath ?? null,
        badges: [
            { text: declarationKindLabelOf(node.declarationKind ?? "") },
            ...(namespace === undefined ? [] : [{ text: `package ${namespace}` }]),
            ...(level === undefined ? [] : [{ text: `level ${level}` }]),
            ...cycleBadge(cycles.cycleCount)
        ],
        declarations: null,
        sections: [
            section(
                "Uses",
                groupedByFile(uses, edge => edge.toNodeName),
                own,
                context
            ),
            section(
                "Used by",
                groupedByFile(usedBy, edge => edge.fromNodeName),
                own,
                context
            )
        ],
        ...cycles,
        action: null
    }
}

function describeFolder(folder: LeveledNode, context: PanelContext): PanelModel {
    const files = filesIn(folder)
    const declarations = files.flatMap(file => context.index.declarationsOfFile.get(file.path) ?? [])
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const touching = [...inside, ...outgoing, ...incoming]
    const cycles = cyclesOf(declarations, context)
    const isPackage = folder.kind === "package"
    return {
        kind: "folder",
        title: folder.name,
        parent: null,
        path: folder.path,
        copyText: isPackage ? folder.name : folder.path,
        badges: [
            { text: isPackage ? "package" : "folder" },
            { text: counted(files.length, "file") },
            { text: counted(declarations.length, "declaration") },
            { text: `${touching.filter(edge => edge.isCyclic).length} cyclic` },
            { text: `${touching.filter(context.pointsUpward).length} upward` },
            ...cycleBadge(cycles.cycleCount)
        ],
        declarations: null,
        sections: [],
        ...cycles,
        action: null
    }
}

function describeEdge(edge: GraphEdge, title: string, context: PanelContext): PanelModel {
    const isTold = (path: string) => context.index.declarations.has(path)
    const told = edge.declarationEdges.filter(leafEdge => isTold(fromPathOf(leafEdge)) && isTold(toPathOf(leafEdge)))
    const isUnfolded = isTold(edge.fromPath) && isTold(edge.toPath)
    return {
        kind: "edge",
        title,
        parent: null,
        path: edge.id,
        copyText: null,
        badges: [{ text: weightOf(edge, context.edgeMetric) }, ...usageCounts(told)],
        declarations: null,
        sections: [section("Stands for", [{ heading: null, label: "", leafEdges: told }], new Set(), context)],
        cycles: [],
        cycleCount: 0,
        mayMissCycles: false,
        action: told.length > 0 && !isUnfolded ? "unfold" : null
    }
}

function weightOf(edge: GraphEdge, edgeMetric: string | null): string {
    return isDependencyEdgeMetric(edgeMetric) ? counted(edge.weight, "dependency", "dependencies") : `${edgeMetric} ${edge.weight}`
}

function cycleBadge(cycleCount: number): PanelBadge[] {
    return cycleCount === 0 ? [] : [{ text: counted(cycleCount, "cycle"), isAboutCycles: true }]
}

function pathsOf(declarations: readonly IndexedDeclaration[]): ReadonlySet<string> {
    return new Set(declarations.map(declaration => declaration.path))
}

function usageCounts(leafEdges: readonly DependencyLeafEdge[]): PanelBadge[] {
    const counts = new Map<string, number>()
    for (const usage of leafEdges.flatMap(leafEdge => leafEdge.usage)) {
        counts.set(usage, (counts.get(usage) ?? 0) + 1)
    }
    return [...counts]
        .sort(([usageA, countA], [usageB, countB]) => countB - countA || usageA.localeCompare(usageB))
        .map(([usage, count]) => ({ text: `${usageLabelOf(usage)} ${count}` }))
}

function declarationList(declarations: readonly IndexedDeclaration[], rowLimit: number): PanelDeclarations {
    const items = declarations
        .map(declaration => ({ ref: declarationRef(declaration), detail: detailOf(declaration) }))
        .sort((itemA, itemB) => itemA.ref.name.localeCompare(itemB.ref.name))
    return { count: items.length, items: items.slice(0, rowLimit), hiddenCount: Math.max(0, items.length - rowLimit) }
}

function detailOf({ leaf }: IndexedDeclaration): string {
    return [declarationKindLabelOf(leaf.kind).toLowerCase(), ...(leaf.level === undefined ? [] : [`level ${leaf.level}`])].join(" · ")
}

interface Dependencies {
    /** Both ends among the declarations asked for. */
    inside: DependencyLeafEdge[]
    outgoing: DependencyLeafEdge[]
    incoming: DependencyLeafEdge[]
}

function dependenciesOf(declarations: readonly IndexedDeclaration[], index: DeclarationIndex): Dependencies {
    const paths = pathsOf(declarations)
    const leaving = declarations.flatMap(({ path }) => index.outgoing.get(path) ?? [])
    const arriving = declarations.flatMap(({ path }) => index.incoming.get(path) ?? [])
    return {
        inside: leaving.filter(edge => paths.has(toPathOf(edge))),
        outgoing: leaving.filter(edge => !paths.has(toPathOf(edge))),
        incoming: arriving.filter(edge => !paths.has(fromPathOf(edge)))
    }
}

interface EdgeGroup {
    heading: PanelRef | null
    label: string
    leafEdges: readonly DependencyLeafEdge[]
}

function groupedByFile(leafEdges: readonly DependencyLeafEdge[], fileOf: (leafEdge: DependencyLeafEdge) => string): EdgeGroup[] {
    const byFile = new Map<string, DependencyLeafEdge[]>()
    for (const leafEdge of leafEdges) {
        addToGroup(byFile, fileOf(leafEdge), leafEdge)
    }
    return [...byFile.entries()]
        .sort(([fileA], [fileB]) => fileA.localeCompare(fileB))
        .map(([filePath, edgesOfFile]) => ({ heading: fileRef(filePath), label: "", leafEdges: edgesOfFile }))
}

function section(title: string, groups: readonly EdgeGroup[], own: ReadonlySet<string>, context: PanelContext): PanelSection {
    const { rowLimit } = context
    const filled = groups.filter(group => group.leafEdges.length > 0)
    return {
        title,
        count: filled.reduce((count, group) => count + group.leafEdges.length, 0),
        groups: filled.map(({ heading, label, leafEdges }) => {
            const dependencies = leafEdges.map(leafEdge => dependencyOf(leafEdge, own, context)).sort(byNames)
            return {
                heading,
                label,
                dependencies: dependencies.slice(0, rowLimit),
                hiddenCount: Math.max(0, dependencies.length - rowLimit)
            }
        })
    }
}

function dependencyOf(leafEdge: DependencyLeafEdge, own: ReadonlySet<string>, { index, pointsUpward }: PanelContext): PanelDependency {
    return {
        from: declarationRef(index.declarations.get(fromPathOf(leafEdge))),
        to: declarationRef(index.declarations.get(toPathOf(leafEdge))),
        isFromOwn: own.has(fromPathOf(leafEdge)),
        isToOwn: own.has(toPathOf(leafEdge)),
        usages: leafEdge.usage.map(usageLabelOf),
        ...linkOf(leafEdge, { pointsUpward }),
        leafEdge
    }
}

function linkOf(leafEdge: DependencyLeafEdge, { pointsUpward }: Pick<PanelContext, "pointsUpward">): PanelLink {
    return {
        line: lineStyleOfUsages(leafEdge.usage),
        type: dependencyEdgeTypeOf({ isCyclic: leafEdge.isCyclic, isPointingUpwards: pointsUpward(leafEdge) })
    }
}

function byNames(dependencyA: PanelDependency, dependencyB: PanelDependency): number {
    return dependencyA.from.name.localeCompare(dependencyB.from.name) || dependencyA.to.name.localeCompare(dependencyB.to.name)
}

type PanelCycles = Pick<PanelModel, "cycles" | "cycleCount" | "mayMissCycles">

function cyclesOf(declarations: readonly IndexedDeclaration[], context: PanelContext): PanelCycles {
    const { index, cycles, rowLimit, mayMissCycles } = context
    const own = pathsOf(declarations)
    const chains = cyclesThrough(own, cycles)
    return {
        cycleCount: chains.length,
        mayMissCycles,
        cycles: chains.slice(0, rowLimit).map(chain => {
            const walked = startingAt(chain, own)
            return {
                steps: [fromPathOf(walked[0]), ...walked.map(toPathOf)].map(path => declarationRef(index.declarations.get(path))),
                files: [...new Set(walked.map(leafEdge => leafEdge.fromNodeName))].map(fileRef),
                links: walked.map(leafEdge => linkOf(leafEdge, context)),
                leafEdges: walked
            }
        })
    }
}

/** A cycle has no first declaration; it is told from one of the selection's own, since that is where the reader stands. */
function startingAt(chain: CycleChain, own: ReadonlySet<string>): CycleChain {
    const start = Math.max(
        0,
        chain.findIndex(leafEdge => own.has(fromPathOf(leafEdge)))
    )
    return [...chain.slice(start), ...chain.slice(0, start)]
}

function filesIn(node: LeveledNode): LeveledNode[] {
    return node.kind === "file" ? [node] : node.children.flatMap(filesIn)
}

function declarationRef({ path, leaf }: IndexedDeclaration): PanelRef {
    return { path, name: leaf.name, kind: "declaration", declarationKind: leaf.kind }
}

function fileRef(path: string): PanelRef {
    return { path, name: nameOfPath(path), kind: "file" }
}
