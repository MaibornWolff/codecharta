import { SortingOptionAction, SortingOptionActions, setSortingOption } from "./sortingOption.actions"

export function sortingOption(state = setSortingOption().payload, action: SortingOptionAction) {
	switch (action.type) {
		case SortingOptionActions.SET_SORTING_OPTION:
			return action.payload
		default:
			return state
	}
}
