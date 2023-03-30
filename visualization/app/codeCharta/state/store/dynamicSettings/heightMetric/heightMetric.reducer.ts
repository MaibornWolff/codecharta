import { createReducer, on } from "@ngrx/store"
import { setHeightMetric } from "./heightMetric.actions"

export const heightMetric = createReducer(
	null,
	on(setHeightMetric, (_state, payload) => payload.value)
)
