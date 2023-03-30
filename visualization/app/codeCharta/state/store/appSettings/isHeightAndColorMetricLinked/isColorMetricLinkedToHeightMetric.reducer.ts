import { createReducer, on } from "@ngrx/store"
import {
	setIsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric
} from "./isColorMetricLinkedToHeightMetric.actions"

export const isColorMetricLinkedToHeightMetric = createReducer(
	false,
	on(setIsColorMetricLinkedToHeightMetricAction, (_state, payload) => payload.value),
	on(toggleIsColorMetricLinkedToHeightMetric, state => !state)
)
