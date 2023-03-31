import { createReducer, on } from "@ngrx/store"
import { toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"

export const defaultIsEdgeMetricVisible = true
export const isEdgeMetricVisible = createReducer(
	defaultIsEdgeMetricVisible,
	on(toggleEdgeMetricVisible, state => !state)
)
