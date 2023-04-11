import { createReducer, on } from "@ngrx/store"
import { setInvertHeight } from "./invertHeight.actions"

export const defaultInvertHeight = false
export const invertHeight = createReducer(
	defaultInvertHeight,
	on(setInvertHeight, (_state, action) => action.value)
)
