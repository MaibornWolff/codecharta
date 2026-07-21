import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { sortNodesInPlace } from "./sortNodesInPlace"

/**
 * The explorer tree sorted by a GIVEN order — parameterized rather than reading the sort from global state,
 * so each view sorts by its OWN order (metrics: `preferences.sorting`; domain: its `domainState` sort),
 * supplied by the composing layer through the EXPLORER_SORT port.
 */
export const createExplorerTreeNodeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) =>
    createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) => {
        // cloned to allow in-place sorting without mutating selector inputs
        return sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    })
