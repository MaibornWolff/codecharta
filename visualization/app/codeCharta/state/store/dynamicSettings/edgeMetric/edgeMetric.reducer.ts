import { createReducer, on } from "@ngrx/store"
import { setEdgeMetric } from "./edgeMetric.actions"

export const edgeMetric = createReducer(
	null,
	on(setEdgeMetric, (_state, payload) => payload.value)
)
