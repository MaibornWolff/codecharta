import { createReducer, on } from "@ngrx/store"
import { setInvertHeight } from "./invertHeight.actions"

export const invertHeight = createReducer(
	false,
	on(setInvertHeight, (_state, payload) => payload.value)
)
