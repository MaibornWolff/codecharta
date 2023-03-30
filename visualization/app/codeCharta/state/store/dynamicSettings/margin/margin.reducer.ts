import { createReducer, on } from "@ngrx/store"
import { setMargin } from "./margin.actions"

export const margin = createReducer(
	50,
	on(setMargin, (_state, payload) => payload.value)
)
