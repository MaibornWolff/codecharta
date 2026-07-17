import { createAction, props } from "@ngrx/store"

export const setShowMetricLabelNameValue = createAction("SET_SHOW_METRIC_LABEL_NAME_VALUE", props<{ value: boolean }>())
