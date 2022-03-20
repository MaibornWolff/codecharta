import { klona } from "klona"

import { createSelector } from "../../../../state/angular-redux/store"
import { unifiedMapNodeSelector } from "../../../../state/selectors/accumulatedData/unifiedMapNode.selector"
import { sortingOrderAscendingSelector } from "../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { sortingOrderSelector } from "../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { sortNode } from "./sortNode"

const clonedUnifiedMapNodeSelector = createSelector([unifiedMapNodeSelector], unifiedMapNode => klona(unifiedMapNode))

// use cloned map as it is sorted inline
export const mapTreeViewNodeSelector = createSelector(
	[clonedUnifiedMapNodeSelector, sortingOrderSelector, sortingOrderAscendingSelector],
	(clonedUnifiedMapNode, sortingOrder, sortingOrderAscending) => {
		return sortNode(clonedUnifiedMapNode, sortingOrder, sortingOrderAscending)
	}
)
