import { createReducer, on } from "@ngrx/store"
import { toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"

export const isEdgeMetricVisible = createReducer(
	true,
	on(toggleEdgeMetricVisible, state => !state)
)
