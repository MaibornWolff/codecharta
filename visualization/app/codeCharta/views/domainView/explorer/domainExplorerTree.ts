import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { klona } from "klona"
import { ExplorerTree, sortNodesInPlace } from "../../../features/sidebarExplorer/facade"
import { viewIndependentTreeSelector } from "../../../lenses/structure/structure.facade"
import { CcState, CodeMapNode, SortingOption } from "../../../model/codeCharta.model"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isInsideFolder } from "../isInsideFolder"

// The domain view reads the view-independent tree, so the map's exclusions neither hide its nodes nor
// skews the file counts it sorts by. Under a focus it lists the focused folder alone, so nothing the
// cloud leaves out can be picked.
const domainExplorerRootSelector = createSelector(
    viewIndependentTreeSelector,
    currentFocusedNodePathSelector,
    (tree, focusedNodePath) => (tree && focusedNodePath && findNode(tree, focusedNodePath)) || tree
)

const createDomainExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) =>
    createSelector(domainExplorerRootSelector, root => sortNodesInPlace(klona(root), sortingOrder, sortingOrderAscending))

function findNode(node: CodeMapNode, path: string): CodeMapNode | undefined {
    if (node.path === path) {
        return node
    }
    const childHoldingThePath = node.children?.find(child => child.path !== undefined && isInsideFolder(path, child.path))
    return childHoldingThePath && findNode(childHoldingThePath, path)
}

@Injectable()
export class DomainExplorerTree implements ExplorerTree {
    private readonly store = inject<Store<CcState>>(Store)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createDomainExplorerTreeSelector(sortingOrder, sortingOrderAscending))
    }
}
