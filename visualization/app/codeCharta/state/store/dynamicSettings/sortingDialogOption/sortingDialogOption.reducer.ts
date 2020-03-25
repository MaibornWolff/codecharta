import { SortingDialogOptionAction, SortingDialogOptionActions, setSortingDialogOption } from "./sortingDialogOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

export function sortingDialogOption(
	state: SortingOption = setSortingDialogOption().payload,
	action: SortingDialogOptionAction
): SortingOption {
	switch (action.type) {
		case SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION:
			return action.payload
		default:
			return state
	}
}
