import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

export const showMetricLabelNodeName = createReducer(
	true,
	on(setShowMetricLabelNodeName, (_state, payload) => payload.value)
)
