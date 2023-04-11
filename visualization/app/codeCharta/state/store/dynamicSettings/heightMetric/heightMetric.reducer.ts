import { createReducer, on } from "@ngrx/store"
import { setHeightMetric } from "./heightMetric.actions"

export const defaultHeightMetric: null | string = null
export const heightMetric = createReducer(
	defaultHeightMetric,
	on(setHeightMetric, (_state, action) => action.value)
)
