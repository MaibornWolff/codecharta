import { createReducer, on } from "@ngrx/store"
import { setSearchPattern } from "./searchPattern.actions"

export const searchPattern = createReducer(
	"",
	on(setSearchPattern, (_state, payload) => payload.value)
)
