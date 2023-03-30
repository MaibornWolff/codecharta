import { createReducer, on } from "@ngrx/store"
import { setPresentationMode } from "./isPresentationMode.actions"

export const isPresentationMode = createReducer(
	false,
	on(setPresentationMode, (_state, payload) => payload.value)
)
