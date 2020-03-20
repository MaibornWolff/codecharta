import { SortingOrderAscendingAction, SortingOrderAscendingActions, setSortingOrderAscending } from "./sortingOrderAscending.actions"
const clone = require("rfdc")()

export function sortingOrderAscending(state: boolean = setSortingOrderAscending().payload, action: SortingOrderAscendingAction): boolean {
	switch (action.type) {
		case SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING:
			return clone(action.payload) //TODO: clone not required for primitives
		default:
			return state
	}
}
