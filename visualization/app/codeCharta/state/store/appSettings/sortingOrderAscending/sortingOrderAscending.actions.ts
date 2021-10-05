import { Action } from "redux"

export enum SortingOrderAscendingActions {
	SET_SORTING_ORDER_ASCENDING = "SET_SORTING_ORDER_ASCENDING",
	TOGGLE_SORTING_ORDER_ASCENDING = "TOGGLE_SORTING_ORDER_ASCENDING"
}

export interface SetSortingOrderAscendingAction extends Action {
	type: SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING
	payload: boolean
}

export type SortingOrderAscendingAction = SetSortingOrderAscendingAction

export const defaultSortingOrderAscending = false

export function setSortingOrderAscending(sortingOrderAscending: boolean = defaultSortingOrderAscending): SetSortingOrderAscendingAction {
	return {
		type: SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING,
		payload: sortingOrderAscending
	}
}

export interface ToggleSortingOrderAscendingAction extends Action {
	type: SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING
}

export function toggleSortingOrderAscending(): ToggleSortingOrderAscendingAction {
	return {
		type: SortingOrderAscendingActions.TOGGLE_SORTING_ORDER_ASCENDING
	}
}
