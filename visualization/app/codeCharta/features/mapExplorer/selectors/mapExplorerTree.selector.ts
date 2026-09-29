import { createSelector } from "@ngrx/store"
import { klona } from "klona"
import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { sortNodesInPlace } from "../../sidebarExplorer/facade"

// Only area sorting reads the area metric; the other orders must not rebuild the tree when the metrics view picks another metric.
export const createMapExplorerTreeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) => {
    if (sortingOrder !== SortingOption.AREA_SIZE) {
        return createSelector(accumulatedDataSelector, accumulatedData =>
            sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending)
        )
    }
    return createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) =>
        sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    )
}
