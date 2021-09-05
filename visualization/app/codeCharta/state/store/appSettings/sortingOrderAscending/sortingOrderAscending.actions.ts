import { Action } from "redux"

export enum SortingOrderAscendingActions {
	TOGGLE_SORTING_ORDER_ASCENDING = "TOGGLE_SORTING_ORDER_ASCENDING"
}

export interface ToggleSortingOrderAscendingAction extends Action {
	type: SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING
}

export type SortingOrderAscendingAction = ToggleSortingOrderAscendingAction

export function toggleSortingOrderAscending(): ToggleSortingOrderAscendingAction {
	return {
		type: SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING
	}
}
