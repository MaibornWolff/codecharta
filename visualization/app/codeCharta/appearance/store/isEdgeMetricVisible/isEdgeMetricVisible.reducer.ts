import { createReducer, on } from "@ngrx/store"
import { setIsEdgeMetricVisible, toggleEdgeMetricVisible } from "./isEdgeMetricVisible.actions"

export const defaultIsEdgeMetricVisible = true
export const isEdgeMetricVisible = createReducer(
    defaultIsEdgeMetricVisible,
    on(setIsEdgeMetricVisible, (_state, action) => action.value),
    on(toggleEdgeMetricVisible, state => !state)
)
