import { createReducer, on } from "@ngrx/store"
import { setAreaMetric } from "./areaMetric.actions"

export const areaMetric = createReducer(
	null,
	on(setAreaMetric, (_state, payload) => payload.value)
)
