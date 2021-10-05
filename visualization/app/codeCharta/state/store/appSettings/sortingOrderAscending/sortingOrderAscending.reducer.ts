import {
	SortingOrderAscendingAction,
	SortingOrderAscendingActions,
	setSortingOrderAscending,
	ToggleSortingOrderAscendingAction
} from "./sortingOrderAscending.actions"

export function sortingOrderAscending(
	state = setSortingOrderAscending().payload,
	action: SortingOrderAscendingAction | ToggleSortingOrderAscendingAction
) {
	switch (action.type) {
		case SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING:
			return action.payload
		case SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING:
			return !state
		default:
			return state
	}
}
