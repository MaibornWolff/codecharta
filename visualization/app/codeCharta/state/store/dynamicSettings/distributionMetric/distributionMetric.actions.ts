import { createAction, props } from "@ngrx/store"

export const setDistributionMetric = createAction("SET_DISTRIBUTION_METRIC", props<{ value: string }>())
