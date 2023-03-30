import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

export const showMetricLabelNameValue = createReducer(
	false,
	on(setShowMetricLabelNameValue, (_state, payload) => payload.value)
)
