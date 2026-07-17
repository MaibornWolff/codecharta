import { createAction, props } from "@ngrx/store"

export const setEdgeMetric = createAction("SET_EDGE_METRIC", props<{ value: string }>())
