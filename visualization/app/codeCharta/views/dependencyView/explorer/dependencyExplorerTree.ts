import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { klona } from "klona"
import { ExplorerTree, sortNodesInPlace } from "../../../features/sidebarExplorer/facade"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"

// The same tree the metrics explorer shows, so the graph and the explorer leave out the same excluded nodes.
const createDependencyExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) =>
    createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) =>
        sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    )

@Injectable()
export class DependencyExplorerTree implements ExplorerTree {
    private readonly store = inject<Store<CcState>>(Store)

    rootNodeFor(sortingOrder: SortingOption, sortingOrderAscending: boolean) {
        return this.store.select(createDependencyExplorerTreeSelector(sortingOrder, sortingOrderAscending))
    }
}
