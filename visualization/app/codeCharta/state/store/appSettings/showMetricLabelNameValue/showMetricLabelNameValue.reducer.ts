import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

export const defaultShowMetricLabelNameValue = false
export const showMetricLabelNameValue = createReducer(
	defaultShowMetricLabelNameValue,
	on(setShowMetricLabelNameValue, (_state, payload) => payload.value)
)
