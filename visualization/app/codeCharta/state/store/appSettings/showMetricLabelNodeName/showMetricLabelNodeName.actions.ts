import { createAction, props } from "@ngrx/store"

export const setShowMetricLabelNodeName = createAction("SET_SHOW_METRIC_LABEL_NODE_NAME", props<{ value: boolean }>())
