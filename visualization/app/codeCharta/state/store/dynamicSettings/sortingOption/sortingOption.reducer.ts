import { createReducer, on } from "@ngrx/store"
import { SortingOption } from "../../../../codeCharta.model"
import { setSortingOption } from "./sortingOption.actions"

export const sortingOption = createReducer(
	SortingOption.NAME,
	on(setSortingOption, (_state, payload) => payload.value)
)
