import { SortingOrderAscendingAction, SortingOrderAscendingActions, setSortingOrderAscending } from "./sortingOrderAscending.actions"

export function sortingOrderAscending(state: boolean = setSortingOrderAscending().payload, action: SortingOrderAscendingAction) {
	switch (action.type) {
		case SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING:
			return action.payload
		default:
			return state
	}
}
