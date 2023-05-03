import { createReducer, on } from "@ngrx/store"
import { setSearchPattern } from "./searchPattern.actions"
import { setStandard } from "../../files/files.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSearchPattern = ""
export const searchPattern = createReducer(
	defaultSearchPattern,
	on(setSearchPattern, setState(defaultSearchPattern)),
	on(setStandard, () => defaultSearchPattern)
)
