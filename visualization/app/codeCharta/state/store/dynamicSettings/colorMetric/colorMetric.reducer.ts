import { createReducer, on } from "@ngrx/store"
import { setColorMetric } from "./colorMetric.actions"

export const colorMetric = createReducer(
	null,
	on(setColorMetric, (_state, payload) => payload.value)
)
