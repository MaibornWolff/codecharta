import { createAction, props } from "@ngrx/store"

export const setHeightMetric = createAction("SET_HEIGHT_METRIC", props<{ value: string }>())
