import { Action } from "redux"
import { SortingOption } from "../../../../codeCharta.model"

export enum SortingOptionActions {
	SET_SORTING_OPTION = "SET_SORTING_OPTION"
}

export interface SetSortingOptionAction extends Action {
	type: SortingOptionActions.SET_SORTING_OPTION
	payload: SortingOption
}

export type SortingOptionAction = SetSortingOptionAction

export function setSortingOption(sortingOption: SortingOption = defaultSortingOption): SetSortingOptionAction {
	return {
		type: SortingOptionActions.SET_SORTING_OPTION,
		payload: sortingOption
	}
}

export const defaultSortingOption: SortingOption = SortingOption.NAME
