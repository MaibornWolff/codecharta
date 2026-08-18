import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { sortNodesInPlace } from "./sortNodesInPlace"

// Only area sorting reads the area metric; the other orders must not rebuild the tree when the map view picks another metric.
export const createExplorerTreeNodeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) => {
    if (sortingOrder !== SortingOption.AREA_SIZE) {
        return createSelector(accumulatedDataSelector, accumulatedData =>
            sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending)
        )
    }
    return createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) =>
        sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    )
}
