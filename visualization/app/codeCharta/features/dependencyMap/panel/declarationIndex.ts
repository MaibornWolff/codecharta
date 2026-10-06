import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeaf, DependencyLeafEdge } from "../../../model/codeCharta.model"
import { addToGroup, declarationPathOf } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

export interface IndexedDeclaration {
    path: string
    filePath: string
    leaf: DependencyLeaf
}

/** The declarations and their dependencies by the path the graph gives a declaration, so that what the panel
 * shows of one is a lookup however large the map is. */
export interface DeclarationIndex {
    declarations: ReadonlyMap<string, IndexedDeclaration>
    declarationsOfFile: ReadonlyMap<string, readonly IndexedDeclaration[]>
    outgoing: ReadonlyMap<string, readonly DependencyLeafEdge[]>
    incoming: ReadonlyMap<string, readonly DependencyLeafEdge[]>
}

export function fromPathOf(leafEdge: DependencyLeafEdge): string {
    return declarationPathOf(leafEdge.fromNodeName, leafEdge.fromLeaf)
}

export function toPathOf(leafEdge: DependencyLeafEdge): string {
    return declarationPathOf(leafEdge.toNodeName, leafEdge.toLeaf)
}

/** Only the declarations of the files the graph draws are indexed, all of them where none are named: an excluded
 * file or one outside the focus has no box to go to. A dependency reaching a declaration that is not indexed is
 * left out, since nothing could be said of its end. */
export function indexDeclarations(
    { leaves, leafEdges }: Pick<DependencyDeclarations, "leaves" | "leafEdges">,
    drawnFilePaths?: ReadonlySet<string>
): DeclarationIndex {
    const declarations = new Map<string, IndexedDeclaration>()
    const declarationsOfFile = new Map<string, IndexedDeclaration[]>()
    for (const [filePath, leavesOfFile] of Object.entries(leaves)) {
        if (drawnFilePaths && !drawnFilePaths.has(filePath)) {
            continue
        }
        const ofFile = Object.entries(leavesOfFile).map(([key, leaf]) => ({ path: declarationPathOf(filePath, key), filePath, leaf }))
        declarationsOfFile.set(filePath, ofFile)
        for (const declaration of ofFile) {
            declarations.set(declaration.path, declaration)
        }
    }
    const outgoing = new Map<string, DependencyLeafEdge[]>()
    const incoming = new Map<string, DependencyLeafEdge[]>()
    for (const leafEdge of leafEdges) {
        if (declarations.has(fromPathOf(leafEdge)) && declarations.has(toPathOf(leafEdge))) {
            addToGroup(outgoing, fromPathOf(leafEdge), leafEdge)
            addToGroup(incoming, toPathOf(leafEdge), leafEdge)
        }
    }
    return { declarations, declarationsOfFile, outgoing, incoming }
}
