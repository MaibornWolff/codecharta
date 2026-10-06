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
import { CycleChain, cyclesThrough } from "../declarations/cycleChains"
import { DeclarationIndex, fromPathOf, IndexedDeclaration, toPathOf } from "../declarations/declarationIndex"

type InspectorReferenceKind = "folder" | "file" | "declaration"

/** Something the inspector names that the reader can go to. */
export interface InspectorReference {
    path: string
    name: string
    kind: InspectorReferenceKind
    declarationKind?: string
}

/** What stands above the name and leads there: the box around the selection. */
interface InspectorParent extends InspectorReference {
    shownAs: string
}

/** A short fact under the name; one about cycles is set off in the colour of the cycles. */
interface InspectorBadge {
    text: string
    isAboutCycles?: boolean
}

export interface InspectorDependency {
    from: InspectorReference
    to: InspectorReference
    /** Whether the end belongs to the selection, so the reader sees at once which way the dependency runs. */
    isFromOwn: boolean
    isToOwn: boolean
    usages: string[]
    /** The dashes and arrowhead of its strongest way of use. */
    line: LineStyle
    /** The edge type it is drawn in. */
    type: DependencyEdgeType
    declarationEdge: DependencyLeafEdge
}

/** The dependencies shared with one other file, under that file's name, under a plain label, or under nothing. */
interface InspectorGroup {
    heading: InspectorReference | string | null
    dependencies: InspectorDependency[]
    hiddenCount: number
}

interface InspectorSection {
    title: string
    count: number
    groups: InspectorGroup[]
}

interface InspectorDeclaration {
    reference: InspectorReference
    /** Its kind and level, as far as the map tells them. */
    detail: string
}

interface InspectorDeclarations {
    count: number
    items: InspectorDeclaration[]
    hiddenCount: number
}

/** A declaration a cycle runs through, and how its dependency on the next one is drawn; the last leads back to the first. */
interface InspectorCycleStep {
    reference: InspectorReference
    linkToNext: InspectorLink
}

export interface InspectorCycle {
    steps: InspectorCycleStep[]
    /** The files the cycle runs through. */
    files: InspectorReference[]
    declarationEdges: CycleChain
}

/** The look of an edge: the dashes and arrowhead of its strongest way of use, and the edge type it is drawn in. */
interface InspectorLink {
    line: LineStyle
    type: DependencyEdgeType
}

export type InspectorActionKind = "open" | "close" | "unfold"

export interface InspectorModel {
    kind: InspectorReferenceKind | "edge"
    title: string
    parent: InspectorParent | null
    path: string
    /** What the copy button copies; null where there is nothing worth copying. */
    copyText: string | null
    badges: InspectorBadge[]
    declarations: InspectorDeclarations | null
    sections: InspectorSection[]
    /** The cycles running through the selection; a hub's are cut like its rows. */
    cycles: InspectorCycle[]
    cycleCount: number
    /** Whether the map is too tangled for its cycles to have been searched to the end. */
    mayMissCycles: boolean
    action: InspectorActionKind | null
}

/** The parent is the box drawn around the node, which its path does not tell: a package holds files from any
 * folder, and a chain of folders is drawn as one box. */
interface BoxSubject {
    kind: "box"
    node: LeveledNode
    parent: LeveledNode | null
    isOpen: boolean
}

export type InspectorSubject = BoxSubject | { kind: "edge"; edge: GraphEdge; fromName: string; toName: string }

export interface InspectorContext {
    index: DeclarationIndex
    /** Every cycle of the map. */
    cycles: readonly CycleChain[]
    mayMissCycles: boolean
    edgeMetric: string | null
    /** A hub's rows are cut at this many per group and list, so the inspector of a hub stays a inspector. */
    rowLimit: number
    /** Whether a dependency is drawn pointing upward in the hierarchy shown: between two files the folders
     * decide that by the file edge, the packages by the dependency itself. */
    pointsUpward: (declarationEdge: DependencyLeafEdge) => boolean
}

export const INSPECTOR_ROW_LIMIT = 20

const THIS_FILE = "this file"

export function describeSubject(subject: InspectorSubject, context: InspectorContext): InspectorModel {
    if (subject.kind === "edge") {
        return describeEdge(subject.edge, `${subject.fromName} → ${subject.toName}`, context)
    }
    return { ...describeBox(subject, context), parent: subject.parent && parentOf(subject.parent) }
}

function describeBox({ node, isOpen }: BoxSubject, context: InspectorContext): InspectorModel {
    switch (node.kind) {
        case "declaration":
            return describeDeclaration(node, context)
        case "file":
            return describeFile(node, isOpen, context)
        default:
            return describeFolder(node, context)
    }
}

function parentOf(node: LeveledNode): InspectorParent {
    const kind = node.kind === "file" ? "file" : "folder"
    const shownAs = isPackagePath(node.path) ? `package ${node.name}` : node.path
    return { path: node.path, name: node.name, kind, shownAs }
}

function describeFile(file: LeveledNode, isOpen: boolean, context: InspectorContext): InspectorModel {
    const declarations = context.index.declarationsOfFile.get(file.path) ?? []
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const cycles = cyclesOf(declarations, context)
    return {
        kind: "file",
        title: file.name,
        parent: null,
        path: file.path,
        copyText: file.path,
        badges: [...fileBadges(declarations), ...cycleBadge(cycles.cycleCount)],
        declarations: declarationList(declarations, context.rowLimit),
        sections: usesAndUsedBy({ insideOwnFile: inside, uses: outgoing, usedBy: incoming }, pathsOf(declarations), context),
        ...cycles,
        action: actionOf(declarations, isOpen)
    }
}

function fileBadges(declarations: readonly IndexedDeclaration[]): InspectorBadge[] {
    const packages = [...new Set(declarations.flatMap(({ leaf }) => (leaf.namespace === undefined ? [] : [leaf.namespace])))]
    return [
        { text: "file" },
        ...packages.map(packageKey => ({ text: `package ${packageKey}` })),
        { text: counted(declarations.length, "declaration") }
    ]
}

function actionOf(declarations: readonly IndexedDeclaration[], isOpen: boolean): InspectorActionKind | null {
    if (declarations.length === 0) {
        return null
    }
    return isOpen ? "close" : "open"
}

function describeDeclaration(node: LeveledNode, context: InspectorContext): InspectorModel {
    const declaration = context.index.declarations.get(node.path)
    const declarations = declaration ? [declaration] : []
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const uses = [...inside.filter(edge => fromPathOf(edge) === node.path), ...outgoing]
    const usedBy = [...inside.filter(edge => toPathOf(edge) === node.path), ...incoming]
    const cycles = cyclesOf(declarations, context)
    return {
        kind: "declaration",
        title: node.name,
        parent: null,
        path: node.path,
        copyText: declaration?.filePath ?? null,
        badges: [...declarationBadges(node, declaration), ...cycleBadge(cycles.cycleCount)],
        declarations: null,
        sections: usesAndUsedBy({ uses, usedBy }, pathsOf(declarations), context),
        ...cycles,
        action: null
    }
}

function declarationBadges(node: LeveledNode, declaration: IndexedDeclaration | undefined): InspectorBadge[] {
    const { namespace, level } = declaration?.leaf ?? {}
    return [
        { text: declarationKindLabelOf(node.declarationKind ?? "") },
        ...(namespace === undefined ? [] : [{ text: `package ${namespace}` }]),
        ...(level === undefined ? [] : [{ text: `level ${level}` }])
    ]
}

function describeFolder(folder: LeveledNode, context: InspectorContext): InspectorModel {
    const files = filesIn(folder)
    const declarations = files.flatMap(file => context.index.declarationsOfFile.get(file.path) ?? [])
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
            ...dependencyBadges(declarations, context),
            ...cycleBadge(cycles.cycleCount)
        ],
        declarations: null,
        sections: [],
        ...cycles,
        action: null
    }
}

function dependencyBadges(declarations: readonly IndexedDeclaration[], context: InspectorContext): InspectorBadge[] {
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const touching = [...inside, ...outgoing, ...incoming]
    return [
        { text: counted(declarations.length, "declaration") },
        { text: `${touching.filter(edge => edge.isCyclic).length} cyclic` },
        { text: `${touching.filter(context.pointsUpward).length} upward` }
    ]
}

interface Uses {
    /** Dependencies between the declarations of the selected file itself. */
    insideOwnFile?: readonly DependencyLeafEdge[]
    uses: readonly DependencyLeafEdge[]
    usedBy: readonly DependencyLeafEdge[]
}

function usesAndUsedBy({ insideOwnFile = [], uses, usedBy }: Uses, ownPaths: ReadonlySet<string>, context: InspectorContext) {
    const ownFile = { heading: THIS_FILE, declarationEdges: insideOwnFile }
    return [
        section("Uses", [ownFile, ...groupedByFile(uses, edge => edge.toNodeName)], ownPaths, context),
        section(
            "Used by",
            groupedByFile(usedBy, edge => edge.fromNodeName),
            ownPaths,
            context
        )
    ]
}

function describeEdge(edge: GraphEdge, title: string, context: InspectorContext): InspectorModel {
    const isIndexed = (path: string) => context.index.declarations.has(path)
    const indexedEdges = edge.declarationEdges.filter(
        declarationEdge => isIndexed(fromPathOf(declarationEdge)) && isIndexed(toPathOf(declarationEdge))
    )
    const isUnfolded = isIndexed(edge.fromPath) && isIndexed(edge.toPath)
    return {
        kind: "edge",
        title,
        parent: null,
        path: edge.id,
        copyText: null,
        badges: [{ text: weightOf(edge, context.edgeMetric) }, ...usageCounts(indexedEdges)],
        declarations: null,
        sections: [section("Stands for", [{ heading: null, declarationEdges: indexedEdges }], new Set(), context)],
        cycles: [],
        cycleCount: 0,
        mayMissCycles: false,
        action: indexedEdges.length > 0 && !isUnfolded ? "unfold" : null
    }
}

function weightOf(edge: GraphEdge, edgeMetric: string | null): string {
    return isDependencyEdgeMetric(edgeMetric) ? counted(edge.weight, "dependency", "dependencies") : `${edgeMetric} ${edge.weight}`
}

function cycleBadge(cycleCount: number): InspectorBadge[] {
    return cycleCount === 0 ? [] : [{ text: counted(cycleCount, "cycle"), isAboutCycles: true }]
}

function pathsOf(declarations: readonly IndexedDeclaration[]): ReadonlySet<string> {
    return new Set(declarations.map(declaration => declaration.path))
}

function usageCounts(declarationEdges: readonly DependencyLeafEdge[]): InspectorBadge[] {
    const counts = new Map<string, number>()
    for (const usage of declarationEdges.flatMap(declarationEdge => declarationEdge.usage)) {
        counts.set(usage, (counts.get(usage) ?? 0) + 1)
    }
    return [...counts]
        .sort(([usageA, countA], [usageB, countB]) => countB - countA || usageA.localeCompare(usageB))
        .map(([usage, count]) => ({ text: `${usageLabelOf(usage)} ${count}` }))
}

function declarationList(declarations: readonly IndexedDeclaration[], rowLimit: number): InspectorDeclarations {
    const items = declarations
        .map(declaration => ({ reference: declarationReference(declaration), detail: detailOf(declaration) }))
        .sort((itemA, itemB) => itemA.reference.name.localeCompare(itemB.reference.name))
    return { count: items.length, items: items.slice(0, rowLimit), hiddenCount: hiddenCountOf(items, rowLimit) }
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

function hiddenCountOf(rows: readonly unknown[], rowLimit: number): number {
    return Math.max(0, rows.length - rowLimit)
}

interface EdgeGroup {
    heading: InspectorGroup["heading"]
    declarationEdges: readonly DependencyLeafEdge[]
}

function groupedByFile(
    declarationEdges: readonly DependencyLeafEdge[],
    fileOf: (declarationEdge: DependencyLeafEdge) => string
): EdgeGroup[] {
    const byFile = new Map<string, DependencyLeafEdge[]>()
    for (const declarationEdge of declarationEdges) {
        addToGroup(byFile, fileOf(declarationEdge), declarationEdge)
    }
    return [...byFile.entries()]
        .sort(([fileA], [fileB]) => fileA.localeCompare(fileB))
        .map(([filePath, edgesOfFile]) => ({ heading: fileReference(filePath), declarationEdges: edgesOfFile }))
}

function section(title: string, groups: readonly EdgeGroup[], ownPaths: ReadonlySet<string>, context: InspectorContext): InspectorSection {
    const { rowLimit } = context
    const filled = groups.filter(group => group.declarationEdges.length > 0)
    return {
        title,
        count: filled.reduce((count, group) => count + group.declarationEdges.length, 0),
        groups: filled.map(({ heading, declarationEdges }) => {
            const dependencies = declarationEdges.map(declarationEdge => dependencyOf(declarationEdge, ownPaths, context)).sort(byNames)
            return { heading, dependencies: dependencies.slice(0, rowLimit), hiddenCount: hiddenCountOf(dependencies, rowLimit) }
        })
    }
}

function dependencyOf(
    declarationEdge: DependencyLeafEdge,
    ownPaths: ReadonlySet<string>,
    { index, pointsUpward }: InspectorContext
): InspectorDependency {
    return {
        from: declarationReference(index.declarations.get(fromPathOf(declarationEdge))),
        to: declarationReference(index.declarations.get(toPathOf(declarationEdge))),
        isFromOwn: ownPaths.has(fromPathOf(declarationEdge)),
        isToOwn: ownPaths.has(toPathOf(declarationEdge)),
        usages: declarationEdge.usage.map(usageLabelOf),
        ...linkOf(declarationEdge, { pointsUpward }),
        declarationEdge
    }
}

function linkOf(declarationEdge: DependencyLeafEdge, { pointsUpward }: Pick<InspectorContext, "pointsUpward">): InspectorLink {
    return {
        line: lineStyleOfUsages(declarationEdge.usage),
        type: dependencyEdgeTypeOf({ isCyclic: declarationEdge.isCyclic, isPointingUpwards: pointsUpward(declarationEdge) })
    }
}

function byNames(dependencyA: InspectorDependency, dependencyB: InspectorDependency): number {
    return dependencyA.from.name.localeCompare(dependencyB.from.name) || dependencyA.to.name.localeCompare(dependencyB.to.name)
}

type InspectorCycles = Pick<InspectorModel, "cycles" | "cycleCount" | "mayMissCycles">

function cyclesOf(declarations: readonly IndexedDeclaration[], context: InspectorContext): InspectorCycles {
    const { index, cycles, rowLimit, mayMissCycles } = context
    const ownPaths = pathsOf(declarations)
    const chains = cyclesThrough(ownPaths, cycles)
    return {
        cycleCount: chains.length,
        mayMissCycles,
        cycles: chains.slice(0, rowLimit).map(chain => {
            const walked = startingAt(chain, ownPaths)
            return {
                steps: walked.map(declarationEdge => ({
                    reference: declarationReference(index.declarations.get(fromPathOf(declarationEdge))),
                    linkToNext: linkOf(declarationEdge, context)
                })),
                files: [...new Set(walked.map(declarationEdge => declarationEdge.fromNodeName))].map(fileReference),
                declarationEdges: walked
            }
        })
    }
}

/** A cycle has no first declaration; it is told from one of the selection's own, since that is where the reader stands. */
function startingAt(chain: CycleChain, ownPaths: ReadonlySet<string>): CycleChain {
    const start = Math.max(
        0,
        chain.findIndex(declarationEdge => ownPaths.has(fromPathOf(declarationEdge)))
    )
    return [...chain.slice(start), ...chain.slice(0, start)]
}

function filesIn(node: LeveledNode): LeveledNode[] {
    return node.kind === "file" ? [node] : node.children.flatMap(filesIn)
}

function declarationReference({ path, leaf }: IndexedDeclaration): InspectorReference {
    return { path, name: leaf.name, kind: "declaration", declarationKind: leaf.kind }
}

function fileReference(path: string): InspectorReference {
    return { path, name: nameOfPath(path), kind: "file" }
}
