import { createAction, props } from "@ngrx/store"

export const setIsEdgeMetricVisible = createAction("SET_IS_EDGE_METRIC_VISIBLE", props<{ value: boolean }>())
export const toggleEdgeMetricVisible = createAction("TOGGLE_IS_EDGE_METRIC_VISIBLE")
