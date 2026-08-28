import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { klona } from "klona"
import { ExplorerTree, sortNodesInPlace } from "../../../features/sidebarExplorer/facade"
import { viewIndependentTreeSelector } from "../../../lenses/structure/structure.facade"
import { CcState, SortingOption } from "../../../model/codeCharta.model"

// The domain view reads the view-independent tree, so the map's blacklist neither hides its nodes nor
// skews the file counts it sorts by.
const createDomainExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) =>
    createSelector(viewIndependentTreeSelector, tree => sortNodesInPlace(klona(tree), sortingOrder, sortingOrderAscending))

@Injectable()
export class DomainExplorerTree implements ExplorerTree {
    private readonly store = inject<Store<CcState>>(Store)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createDomainExplorerTreeSelector(sortingOrder, sortingOrderAscending))
    }
}
