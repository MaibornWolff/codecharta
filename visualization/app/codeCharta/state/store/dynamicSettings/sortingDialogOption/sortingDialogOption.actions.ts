import { Action } from "redux"
import { SortingOption } from "../../../../codeCharta.model"

export enum SortingDialogOptionActions {
	SET_SORTING_DIALOG_OPTION = "SET_SORTING_DIALOG_OPTION"
}

export interface SetSortingDialogOptionAction extends Action {
	type: SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION
	payload: SortingOption
}

export type SortingDialogOptionAction = SetSortingDialogOptionAction

export function setSortingDialogOption(sortingDialogOption: SortingOption = defaultSortingDialogOption): SetSortingDialogOptionAction {
	return {
		type: SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION,
		payload: sortingDialogOption
	}
}

export const defaultSortingDialogOption: SortingOption = SortingOption.NAME
