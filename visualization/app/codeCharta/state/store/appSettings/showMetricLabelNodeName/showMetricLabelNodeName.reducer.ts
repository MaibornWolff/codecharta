import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

export const defaultShowMetricLabelNodeName = true
export const showMetricLabelNodeName = createReducer(
	defaultShowMetricLabelNodeName,
	on(setShowMetricLabelNodeName, (_state, payload) => payload.value)
)
