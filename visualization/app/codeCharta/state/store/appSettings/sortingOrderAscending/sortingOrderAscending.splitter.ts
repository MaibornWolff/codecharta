import { SortingOrderAscendingAction, setSortingOrderAscending } from "./sortingOrderAscending.actions"

export function splitSortingOrderAscendingAction(payload: boolean): SortingOrderAscendingAction {
	return setSortingOrderAscending(payload)
}
