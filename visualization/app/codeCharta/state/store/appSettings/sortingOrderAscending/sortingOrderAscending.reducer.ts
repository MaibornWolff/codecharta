import { SortingOrderAscendingAction, SortingOrderAscendingActions } from "./sortingOrderAscending.actions"

export const defaultSortingOrderAscending = false

export function sortingOrderAscending(state = defaultSortingOrderAscending, action: SortingOrderAscendingAction) {
	switch (action.type) {
		case SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING:
			return !state
		default:
			return state
	}
}
