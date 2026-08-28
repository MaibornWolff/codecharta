import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { ExplorerTree } from "../../../features/sidebarExplorer/facade"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { createMetricsExplorerTreeSelector } from "./metricsExplorerTree.selector"

@Injectable()
export class MetricsExplorerTree implements ExplorerTree {
    private readonly store = inject<Store<CcState>>(Store)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createMetricsExplorerTreeSelector(sortingOrder, sortingOrderAscending))
    }
}
