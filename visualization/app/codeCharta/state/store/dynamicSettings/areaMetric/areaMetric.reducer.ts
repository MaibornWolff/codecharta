import { createReducer, on } from "@ngrx/store"
import { setAreaMetric } from "./areaMetric.actions"

export const defaultAreaMetric: null | string = null
export const areaMetric = createReducer(
	defaultAreaMetric,
	on(setAreaMetric, (_state, payload) => payload.value)
)
