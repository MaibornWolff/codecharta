import { createReducer, on } from "@ngrx/store"
import {
	setIsColorMetricLinkedToHeightMetricAction,
	toggleIsColorMetricLinkedToHeightMetric
} from "./isColorMetricLinkedToHeightMetric.actions"

export const defaultIsColorMetricLinkedToHeightMetric = false
export const isColorMetricLinkedToHeightMetric = createReducer(
	defaultIsColorMetricLinkedToHeightMetric,
	on(setIsColorMetricLinkedToHeightMetricAction, (_state, payload) => payload.value),
	on(toggleIsColorMetricLinkedToHeightMetric, state => !state)
)
