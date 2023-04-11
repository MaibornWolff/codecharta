import { createReducer, on } from "@ngrx/store"
import { setPresentationMode } from "./isPresentationMode.actions"

export const defaultIsPresentationMode = false
export const isPresentationMode = createReducer(
	defaultIsPresentationMode,
	on(setPresentationMode, (_state, action) => action.value)
)
