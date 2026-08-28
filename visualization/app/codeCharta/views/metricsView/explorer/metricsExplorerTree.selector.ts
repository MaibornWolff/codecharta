import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { sortNodesInPlace } from "../../../features/sidebarExplorer/facade"
import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"

// Only area sorting reads the area metric; the other orders must not rebuild the tree when the map view picks another metric.
export const createMetricsExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) => {
    if (sortingOrder !== SortingOption.AREA_SIZE) {
        return createSelector(accumulatedDataSelector, accumulatedData =>
            sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending)
        )
    }
    return createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) =>
        sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    )
}
