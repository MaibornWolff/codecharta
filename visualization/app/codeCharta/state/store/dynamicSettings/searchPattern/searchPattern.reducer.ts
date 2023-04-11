import { createReducer, on } from "@ngrx/store"
import { setSearchPattern } from "./searchPattern.actions"

export const defaultSearchPattern = ""
export const searchPattern = createReducer(
	defaultSearchPattern,
	on(setSearchPattern, (_state, action) => action.value)
)
