import { createReducer, on } from "@ngrx/store"
import { setColorMetric } from "./colorMetric.actions"

export const defaultColorMetric: null | string = null
export const colorMetric = createReducer(
	defaultColorMetric,
	on(setColorMetric, (_state, action) => action.value)
)
