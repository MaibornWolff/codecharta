import { dependencyEdgeTypeOf } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DependencyEdgeType } from "../../../model/dependencyGraph.model"
import {
    declarationKindLabelOf,
    GraphEdge,
    LeveledNode,
    LineStyle,
    lineStyleOfUsages,
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

interface PanelFact {
    label: string
    value: string
    ref?: PanelRef
}

export interface PanelDependency {
    from: PanelRef
    to: PanelRef
    usages: string[]
    /** The dashes and arrowhead of its strongest way of use. */
    line: LineStyle
    /** The edge type it is drawn in. */
    type: DependencyEdgeType
    leafEdge: DependencyLeafEdge
}

/** The dependencies shared with one other file, or all of a section when it has no heading. */
interface PanelGroup {
    heading: PanelRef | null
    dependencies: PanelDependency[]
    hiddenCount: number
}

interface PanelSection {
    title: string
    count: number
    groups: PanelGroup[]
}

interface PanelRefList {
    title: string
    count: number
    refs: PanelRef[]
    hiddenCount: number
}

export interface PanelCycle {
    /** The declarations walked, the first of them again at the end. */
    steps: PanelRef[]
    /** The files the cycle runs through. */
    files: PanelRef[]
    leafEdges: CycleChain
}

export type PanelActionKind = "open" | "close" | "unfold"

export interface PanelModel {
    kind: PanelRefKind | "edge"
    title: string
    subtitle: string
    path: string
    facts: PanelFact[]
    lists: PanelRefList[]
    sections: PanelSection[]
    /** The cycles running through the selection; a hub's are cut like its rows. */
    cycles: PanelCycle[]
    cycleCount: number
    action: PanelActionKind | null
}

export type PanelSubject =
    | { kind: "box"; node: LeveledNode; isOpen: boolean }
    | { kind: "edge"; edge: GraphEdge; fromName: string; toName: string }

export interface PanelContext {
    index: DeclarationIndex
    /** Every cycle of the map. */
    cycles: readonly CycleChain[]
    /** A hub's rows are cut at this many per group and list, so the panel of a hub stays a panel. */
    rowLimit: number
    /** Whether a dependency is drawn pointing upward in the hierarchy shown: between two files the folders
     * decide that by the file edge, the packages by the dependency itself. */
    pointsUpward: (leafEdge: DependencyLeafEdge) => boolean
}

export const PANEL_ROW_LIMIT = 20

export function describeSubject(subject: PanelSubject, context: PanelContext): PanelModel {
    if (subject.kind === "edge") {
        return describeEdge(subject.edge, `${subject.fromName} → ${subject.toName}`, context)
    }
    switch (subject.node.kind) {
        case "declaration":
            return describeDeclaration(subject.node, context)
        case "file":
            return describeFile(subject.node, subject.isOpen, context)
        default:
            return describeFolder(subject.node, context)
    }
}

function describeFile(file: LeveledNode, isOpen: boolean, context: PanelContext): PanelModel {
    const declarations = context.index.declarationsOfFile.get(file.path) ?? []
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const packages = [...new Set(declarations.flatMap(({ leaf }) => (leaf.namespace === undefined ? [] : [leaf.namespace])))]
    return {
        kind: "file",
        title: file.name,
        subtitle: "File",
        path: file.path,
        facts: [
            { label: "Folder", value: parentPathOf(file.path), ref: folderRef(parentPathOf(file.path)) },
            ...(packages.length > 0 ? [{ label: packages.length === 1 ? "Package" : "Packages", value: packages.join(", ") }] : [])
        ],
        lists: [refList("Declarations", declarations.map(declarationRef), context.rowLimit)],
        sections: [
            section("Inside the file", ungrouped(inside), context),
            section(
                "Uses",
                groupedByFile(outgoing, edge => edge.toNodeName),
                context
            ),
            section(
                "Used by",
                groupedByFile(incoming, edge => edge.fromNodeName),
                context
            )
        ],
        ...cyclesOf(declarations, context),
        action: declarations.length === 0 ? null : isOpen ? "close" : "open"
    }
}

function describeDeclaration(node: LeveledNode, context: PanelContext): PanelModel {
    const declaration = context.index.declarations.get(node.path)
    const declarations = declaration ? [declaration] : []
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const uses = [...inside.filter(edge => fromPathOf(edge) === node.path), ...outgoing]
    const usedBy = [...inside.filter(edge => toPathOf(edge) === node.path), ...incoming]
    return {
        kind: "declaration",
        title: node.name,
        subtitle: declarationKindLabelOf(node.declarationKind ?? ""),
        path: node.path,
        facts: declaration ? factsOfDeclaration(declaration) : [],
        lists: [],
        sections: [
            section(
                "Uses",
                groupedByFile(uses, edge => edge.toNodeName),
                context
            ),
            section(
                "Used by",
                groupedByFile(usedBy, edge => edge.fromNodeName),
                context
            )
        ],
        ...cyclesOf(declarations, context),
        action: null
    }
}

function factsOfDeclaration({ filePath, leaf }: IndexedDeclaration): PanelFact[] {
    return [
        { label: "File", value: nameOf(filePath), ref: fileRef(filePath) },
        ...(leaf.namespace === undefined ? [] : [{ label: "Package", value: leaf.namespace }]),
        ...(leaf.level === undefined ? [] : [{ label: "Level", value: String(leaf.level) }])
    ]
}

function describeFolder(folder: LeveledNode, context: PanelContext): PanelModel {
    const files = filesIn(folder)
    const declarations = files.flatMap(file => context.index.declarationsOfFile.get(file.path) ?? [])
    const { inside, outgoing, incoming } = dependenciesOf(declarations, context.index)
    const touching = [...inside, ...outgoing, ...incoming]
    return {
        kind: "folder",
        title: folder.name,
        subtitle: folder.kind === "package" ? "Package" : "Folder",
        path: folder.path,
        facts: [
            { label: "Files", value: String(files.length) },
            { label: "Declarations", value: String(declarations.length) },
            { label: "Cyclic dependencies", value: String(touching.filter(edge => edge.isCyclic).length) },
            { label: "Upward dependencies", value: String(touching.filter(context.pointsUpward).length) }
        ],
        lists: [],
        sections: [],
        ...cyclesOf(declarations, context),
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
        subtitle: "Dependency",
        path: edge.id,
        facts: [{ label: "Dependencies", value: String(edge.weight) }, ...usageCounts(told)],
        lists: [],
        sections: [section("Stands for", ungrouped(told), context)],
        cycles: [],
        cycleCount: 0,
        action: told.length > 0 && !isUnfolded ? "unfold" : null
    }
}

function usageCounts(leafEdges: readonly DependencyLeafEdge[]): PanelFact[] {
    const counts = new Map<string, number>()
    for (const usage of leafEdges.flatMap(leafEdge => leafEdge.usage)) {
        counts.set(usage, (counts.get(usage) ?? 0) + 1)
    }
    return [...counts]
        .sort(([usageA, countA], [usageB, countB]) => countB - countA || usageA.localeCompare(usageB))
        .map(([usage, count]) => ({ label: usageLabelOf(usage), value: String(count) }))
}

interface Dependencies {
    /** Both ends among the declarations asked for. */
    inside: DependencyLeafEdge[]
    outgoing: DependencyLeafEdge[]
    incoming: DependencyLeafEdge[]
}

function dependenciesOf(declarations: readonly IndexedDeclaration[], index: DeclarationIndex): Dependencies {
    const paths = new Set(declarations.map(declaration => declaration.path))
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
    leafEdges: readonly DependencyLeafEdge[]
}

function ungrouped(leafEdges: readonly DependencyLeafEdge[]): EdgeGroup[] {
    return [{ heading: null, leafEdges }]
}

function groupedByFile(leafEdges: readonly DependencyLeafEdge[], fileOf: (leafEdge: DependencyLeafEdge) => string): EdgeGroup[] {
    const byFile = new Map<string, DependencyLeafEdge[]>()
    for (const leafEdge of leafEdges) {
        byFile.set(fileOf(leafEdge), [...(byFile.get(fileOf(leafEdge)) ?? []), leafEdge])
    }
    return [...byFile.entries()]
        .sort(([fileA], [fileB]) => fileA.localeCompare(fileB))
        .map(([filePath, edgesOfFile]) => ({ heading: fileRef(filePath), leafEdges: edgesOfFile }))
}

function section(title: string, groups: readonly EdgeGroup[], context: PanelContext): PanelSection {
    const { rowLimit } = context
    const filled = groups.filter(group => group.leafEdges.length > 0)
    return {
        title,
        count: filled.reduce((count, group) => count + group.leafEdges.length, 0),
        groups: filled.map(({ heading, leafEdges }) => {
            const dependencies = leafEdges.map(leafEdge => dependencyOf(leafEdge, context)).sort(byNames)
            return { heading, dependencies: dependencies.slice(0, rowLimit), hiddenCount: Math.max(0, dependencies.length - rowLimit) }
        })
    }
}

function dependencyOf(leafEdge: DependencyLeafEdge, { index, pointsUpward }: PanelContext): PanelDependency {
    return {
        from: declarationRef(index.declarations.get(fromPathOf(leafEdge))),
        to: declarationRef(index.declarations.get(toPathOf(leafEdge))),
        usages: leafEdge.usage.map(usageLabelOf),
        line: lineStyleOfUsages(leafEdge.usage),
        type: dependencyEdgeTypeOf({ isCyclic: leafEdge.isCyclic, isPointingUpwards: pointsUpward(leafEdge) }),
        leafEdge
    }
}

function byNames(dependencyA: PanelDependency, dependencyB: PanelDependency): number {
    return dependencyA.from.name.localeCompare(dependencyB.from.name) || dependencyA.to.name.localeCompare(dependencyB.to.name)
}

function cyclesOf(
    declarations: readonly IndexedDeclaration[],
    { index, cycles, rowLimit }: PanelContext
): Pick<PanelModel, "cycles" | "cycleCount"> {
    const chains = cyclesThrough(new Set(declarations.map(declaration => declaration.path)), cycles)
    return {
        cycleCount: chains.length,
        cycles: chains.slice(0, rowLimit).map(chain => ({
            steps: [fromPathOf(chain[0]), ...chain.map(toPathOf)].map(path => declarationRef(index.declarations.get(path))),
            files: [...new Set(chain.map(leafEdge => leafEdge.fromNodeName))].map(fileRef),
            leafEdges: chain
        }))
    }
}

function filesIn(node: LeveledNode): LeveledNode[] {
    return node.kind === "file" ? [node] : node.children.flatMap(filesIn)
}

function refList(title: string, refs: PanelRef[], rowLimit: number): PanelRefList {
    const byName = refs.toSorted((refA, refB) => refA.name.localeCompare(refB.name))
    return { title, count: refs.length, refs: byName.slice(0, rowLimit), hiddenCount: Math.max(0, refs.length - rowLimit) }
}

function declarationRef({ path, leaf }: IndexedDeclaration): PanelRef {
    return { path, name: leaf.name, kind: "declaration", declarationKind: leaf.kind }
}

function fileRef(path: string): PanelRef {
    return { path, name: nameOf(path), kind: "file" }
}

function folderRef(path: string): PanelRef {
    return { path, name: nameOf(path), kind: "folder" }
}

function nameOf(path: string): string {
    return path.slice(path.lastIndexOf("/") + 1)
}

function parentPathOf(path: string): string {
    return path.slice(0, path.lastIndexOf("/"))
}
