import { createAction, props } from "@ngrx/store"

export const setColorMetric = createAction("SET_COLOR_METRIC", props<{ value: string }>())
