import { createReducer, on } from "@ngrx/store"
import { setEdgeMetric } from "./edgeMetric.actions"

export const defaultEdgeMetric: null | string = null
export const edgeMetric = createReducer(
	defaultEdgeMetric,
	on(setEdgeMetric, (_state, action) => action.value)
)
