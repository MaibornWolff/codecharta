import { SortingOptionAction, SortingOptionActions, setSortingOption } from "./sortingOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

export function sortingOption(
	state: SortingOption = setSortingOption().payload,
	action: SortingOptionAction
): SortingOption {
	switch (action.type) {
		case SortingOptionActions.SET_SORTING_OPTION:
			return action.payload
		default:
			return state
	}
}
