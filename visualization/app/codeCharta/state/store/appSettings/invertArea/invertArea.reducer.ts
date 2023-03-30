import { createReducer, on } from "@ngrx/store"
import { setInvertArea } from "./invertArea.actions"

export const invertArea = createReducer(
	false,
	on(setInvertArea, (_state, payload) => payload.value)
)
