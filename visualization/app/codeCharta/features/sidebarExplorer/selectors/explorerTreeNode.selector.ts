import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { accumulatedDataSelector } from "../../../renderModel/renderModel.facade"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "../../../preferences/preferences.read.facade"
import { areaMetricSelector } from "../../../mapState/mapState.read.facade"
import { sortNodesInPlace } from "./sortNodesInPlace"

export const explorerTreeNodeSelector = createSelector(
    accumulatedDataSelector,
    sortingOrderSelector,
    sortingOrderAscendingSelector,
    areaMetricSelector,
    (accumulatedData, sortingOrder, sortingOrderAscending, areaMetric) => {
        // cloned to allow in-place sorting without mutating selector inputs
        return sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    }
)
