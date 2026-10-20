import { dependencyEdgeTypeOf } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { DependencyEdgeType } from "../../../model/dependencyGraph.model"
import { LineStyle, lineStyleOfUsages, nameOfPath } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { IndexedDeclaration } from "../declarations/declarationIndex"

export type InspectorReferenceKind = "folder" | "file" | "declaration"

export interface InspectorReference {
    path: string
    name: string
    kind: InspectorReferenceKind
    declarationKind?: string
}

export interface InspectorLink {
    line: LineStyle
    type: DependencyEdgeType
}

export type PointsUpward = (declarationEdge: DependencyLeafEdge) => boolean

export function linkOf(declarationEdge: DependencyLeafEdge, pointsUpward: PointsUpward): InspectorLink {
    return {
        line: lineStyleOfUsages(declarationEdge.usage),
        type: dependencyEdgeTypeOf({ isCyclic: declarationEdge.isCyclic, isPointingUpwards: pointsUpward(declarationEdge) })
    }
}

export function pathsOf(declarations: readonly IndexedDeclaration[]): ReadonlySet<string> {
    return new Set(declarations.map(declaration => declaration.path))
}

export function declarationReference({ path, leaf }: IndexedDeclaration): InspectorReference {
    return { path, name: leaf.name, kind: "declaration", declarationKind: leaf.kind }
}

export function fileReference(path: string): InspectorReference {
    return { path, name: nameOfPath(path), kind: "file" }
}
