import { DependencyDeclarations } from "../../../lenses/dependency/dependencyLens.facade"
import { DependencyLeaf, DependencyLeafEdge } from "../../../model/codeCharta.model"
import { declarationPathOf } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

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

/** A dependency reaching a declaration the map does not tell is left out: nothing could be said of its end. */
export function indexDeclarations({ leaves, leafEdges }: Pick<DependencyDeclarations, "leaves" | "leafEdges">): DeclarationIndex {
    const declarations = new Map<string, IndexedDeclaration>()
    const declarationsOfFile = new Map<string, IndexedDeclaration[]>()
    for (const [filePath, leavesOfFile] of Object.entries(leaves)) {
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
            addTo(outgoing, fromPathOf(leafEdge), leafEdge)
            addTo(incoming, toPathOf(leafEdge), leafEdge)
        }
    }
    return { declarations, declarationsOfFile, outgoing, incoming }
}

function addTo(groups: Map<string, DependencyLeafEdge[]>, key: string, leafEdge: DependencyLeafEdge): void {
    const group = groups.get(key)
    if (group) {
        group.push(leafEdge)
    } else {
        groups.set(key, [leafEdge])
    }
}
