import { createReducer, on } from "@ngrx/store"
import { setIsWhiteBackground } from "./isWhiteBackground.actions"

export const isWhiteBackground = createReducer(
	false,
	on(setIsWhiteBackground, (_state, payload) => payload.value)
)
