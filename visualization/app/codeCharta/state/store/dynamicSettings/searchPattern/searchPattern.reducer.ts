import { createReducer, on } from "@ngrx/store"
import { setSearchPattern } from "./searchPattern.actions"
import { setStandard } from "../../files/files.actions"

export const defaultSearchPattern = ""
export const searchPattern = createReducer(
	defaultSearchPattern,
	on(setSearchPattern, (_state, action) => action.value),
	on(setStandard, () => defaultSearchPattern)
)
