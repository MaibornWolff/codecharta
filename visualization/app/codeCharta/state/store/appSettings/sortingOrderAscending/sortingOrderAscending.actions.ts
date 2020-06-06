import { Action } from "redux"

export enum SortingOrderAscendingActions {
	SET_SORTING_ORDER_ASCENDING = "SET_SORTING_ORDER_ASCENDING"
}

export interface SetSortingOrderAscendingAction extends Action {
	type: SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING
	payload: boolean
}

export type SortingOrderAscendingAction = SetSortingOrderAscendingAction

export function setSortingOrderAscending(
	sortingOrderAscending: boolean = defaultSortingOrderAscending
): SetSortingOrderAscendingAction {
	return {
		type: SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING,
		payload: sortingOrderAscending
	}
}

export const defaultSortingOrderAscending: boolean = false
