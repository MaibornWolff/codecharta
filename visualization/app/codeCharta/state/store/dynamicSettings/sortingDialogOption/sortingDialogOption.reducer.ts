import { SortingDialogOptionAction, SortingDialogOptionActions, setSortingDialogOption } from "./sortingDialogOption.actions"
import { SortingOption } from "../../../../codeCharta.model"
const clone = require("rfdc")()

export function sortingDialogOption(
	state: SortingOption = setSortingDialogOption().payload,
	action: SortingDialogOptionAction
): SortingOption {
	switch (action.type) {
		case SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION:
			return clone(action.payload) //TODO: clone not required for primitives
		default:
			return state
	}
}
