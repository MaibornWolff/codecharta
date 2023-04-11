import { createReducer, on } from "@ngrx/store"
import { SortingOption } from "../../../../codeCharta.model"
import { setSortingOption } from "./sortingOption.actions"

export const defaultSortingOption = SortingOption.NAME
export const sortingOption = createReducer(
	defaultSortingOption,
	on(setSortingOption, (_state, action) => action.value)
)
