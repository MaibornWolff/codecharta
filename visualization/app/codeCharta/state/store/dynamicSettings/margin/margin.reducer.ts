import { createReducer, on } from "@ngrx/store"
import { setMargin } from "./margin.actions"

export const defaultMargin = 50
export const margin = createReducer(
	defaultMargin,
	on(setMargin, (_state, payload) => payload.value)
)
