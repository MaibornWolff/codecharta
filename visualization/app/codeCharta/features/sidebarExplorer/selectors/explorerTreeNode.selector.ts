import { createSelector } from "@ngrx/store"
import { klona } from "klona"

import { SortingOption } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { sortNodesInPlace } from "./sortNodesInPlace"

export const createExplorerTreeNodeSelector = (sortingOrder: SortingOption, sortingOrderAscending: boolean) =>
    createSelector(accumulatedDataSelector, areaMetricSelector, (accumulatedData, areaMetric) =>
        sortNodesInPlace(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending, areaMetric)
    )
