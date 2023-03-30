import { createReducer, on } from "@ngrx/store"
import { setEdgeHeight } from "./edgeHeight.actions"

export const edgeHeight = createReducer(
	4,
	on(setEdgeHeight, (_state, payload) => payload.value)
)
