import { createReducer, on } from "@ngrx/store"
import { setIsWhiteBackground } from "./isWhiteBackground.actions"

export const defaultIsWhiteBackground = false
export const isWhiteBackground = createReducer(
	defaultIsWhiteBackground,
	on(setIsWhiteBackground, (_state, action) => action.value)
)
