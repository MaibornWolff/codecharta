import { createReducer, on } from "@ngrx/store"
import { setInvertArea } from "./invertArea.actions"

export const defaultInvertArea = false
export const invertArea = createReducer(
	defaultInvertArea,
	on(setInvertArea, (_state, action) => action.value)
)
