import { createReducer, on } from "@ngrx/store"
import { setDistributionMetric } from "./distributionMetric.actions"

export const defaultDistributionMetric: null | string = null
export const distributionMetric = createReducer(
	defaultDistributionMetric,
	on(setDistributionMetric, (_state, payload) => payload.value)
)
