import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { accumulatedDataSelector } from "../../../../../state/selectors/accumulatedData/accumulatedData.selector"
import { sortingOrderAscendingSelector } from "../../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { sortingOrderSelector } from "../../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { sortNodesInPlace } from "./sortNodesInPlace"

export const mapTreeViewNodeSelector = createSelector(
    accumulatedDataSelector,
    sortingOrderSelector,
    sortingOrderAscendingSelector,
    (accumulatedData, sortingOrder, sortingOrderAscending) => {
        // use cloned map as it is sorted inline
        return sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending)
    }
)
