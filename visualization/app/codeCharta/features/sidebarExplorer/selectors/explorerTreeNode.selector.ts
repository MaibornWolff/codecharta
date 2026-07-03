import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { sortingOrderAscendingSelector } from "../../../preferences/preferences.read.facade"
import { areaMetricSelector } from "../../../mapState/mapState.read.facade"
import { sortingOrderSelector } from "../../../preferences/preferences.read.facade"
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
