import { createReducer, on } from "@ngrx/store"
import { setEdgeHeight } from "./edgeHeight.actions"

export const defaultEdgeHeight = 4
export const edgeHeight = createReducer(
	defaultEdgeHeight,
	on(setEdgeHeight, (_state, action) => action.value)
)
