import { isDependencyEdgeMetric } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import {
    counted,
    declarationKindLabelOf,
    GraphEdge,
    LeveledNode,
    usageLabelOf
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { IndexedDeclaration } from "../declarations/declarationIndex"
import { PointsUpward } from "./inspectorReferences"

/** A short fact under the name; one about cycles is set off in the colour of the cycles. */
export interface InspectorBadge {
    text: string
    isAboutCycles?: boolean
}

export function fileBadges(declarations: readonly IndexedDeclaration[]): InspectorBadge[] {
    const packages = [...new Set(declarations.flatMap(({ leaf }) => (leaf.namespace === undefined ? [] : [leaf.namespace])))]
    return [
        { text: "file" },
        ...packages.map(packageKey => ({ text: `package ${packageKey}` })),
        { text: counted(declarations.length, "declaration") }
    ]
}

export function declarationBadges(node: LeveledNode, declaration: IndexedDeclaration | undefined): InspectorBadge[] {
    const { namespace, level } = declaration?.leaf ?? {}
    return [
        { text: declarationKindLabelOf(node.declarationKind ?? "") },
        ...(namespace === undefined ? [] : [{ text: `package ${namespace}` }]),
        ...(level === undefined ? [] : [{ text: `level ${level}` }])
    ]
}

export function dependencyBadges(
    declarationCount: number,
    touching: readonly DependencyLeafEdge[],
    pointsUpward: PointsUpward
): InspectorBadge[] {
    return [
        { text: counted(declarationCount, "declaration") },
        { text: `${touching.filter(edge => edge.isCyclic).length} cyclic` },
        { text: `${touching.filter(pointsUpward).length} upward` }
    ]
}

export function edgeBadges(edge: GraphEdge, declarationEdges: readonly DependencyLeafEdge[], edgeMetric: string | null): InspectorBadge[] {
    return [{ text: weightOf(edge, edgeMetric) }, ...usageCounts(declarationEdges)]
}

export function cycleBadge(cycleCount: number): InspectorBadge[] {
    return cycleCount === 0 ? [] : [{ text: counted(cycleCount, "cycle"), isAboutCycles: true }]
}

function weightOf(edge: GraphEdge, edgeMetric: string | null): string {
    return isDependencyEdgeMetric(edgeMetric) ? counted(edge.weight, "dependency", "dependencies") : `${edgeMetric} ${edge.weight}`
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
