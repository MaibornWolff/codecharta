import { setSortingOrderAscending } from "./sortingOrderAscending.actions"

export function splitSortingOrderAscendingAction(payload: boolean) {
	return setSortingOrderAscending(payload)
}
