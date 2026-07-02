import { createAction, props } from "@ngrx/store"

export const setAreaMetric = createAction("SET_AREA_METRIC", props<{ value: string }>())
