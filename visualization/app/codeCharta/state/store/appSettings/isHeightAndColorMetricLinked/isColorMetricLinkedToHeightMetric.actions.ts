import { createAction, props } from "@ngrx/store"

export const setIsColorMetricLinkedToHeightMetricAction = createAction(
    "SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC",
    props<{ value: boolean }>()
)
export const toggleIsColorMetricLinkedToHeightMetric = createAction("TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC")
