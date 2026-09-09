import { createAction, props } from "@ngrx/store"
import { MetricRule } from "../../../../model/codeCharta.model"

export const setMetricRules = createAction("SET_METRIC_RULES", props<{ value: MetricRule[] }>())
export const addMetricRule = createAction("ADD_METRIC_RULE", props<{ rule: MetricRule }>())
export const removeMetricRule = createAction("REMOVE_METRIC_RULE", props<{ id: string }>())
