import { createReducer, on } from "@ngrx/store"
import { setDistributionMetric } from "./distributionMetric.actions"

export const distributionMetric = createReducer(
	null,
	on(setDistributionMetric, (_state, payload) => payload.value)
)
