import { klona } from "klona"
import { createSelector } from "../../../../state/angular-redux/createSelector"

import { accumulatedDataSelector } from "../../../../state/selectors/accumulatedData/accumulatedData.selector"
import { sortingOrderAscendingSelector } from "../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { sortingOrderSelector } from "../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { sortNode } from "./sortNode"

export const mapTreeViewNodeSelector = createSelector(
	[accumulatedDataSelector, sortingOrderSelector, sortingOrderAscendingSelector],
	(accumulatedData, sortingOrder, sortingOrderAscending) => {
		// use cloned map as it is sorted inline
		return sortNode(klona(accumulatedData.unifiedMapNode), sortingOrder, sortingOrderAscending)
	}
)
