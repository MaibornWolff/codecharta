import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { ExplorerTree } from "../../sidebarExplorer/facade"
import { createMapExplorerTreeSelector } from "../selectors/mapExplorerTree.selector"

@Injectable()
export class MapExplorerTree implements ExplorerTree {
    private readonly store = inject<Store<CcState>>(Store)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createMapExplorerTreeSelector(sortingOrder, sortingOrderAscending))
    }
}
