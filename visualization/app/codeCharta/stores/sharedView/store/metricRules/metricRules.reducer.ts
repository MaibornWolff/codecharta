import { createReducer, on } from "@ngrx/store"
import { MetricRule } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { addMetricRule, removeMetricRule, setMetricRules } from "./metricRules.actions"

export const defaultMetricRules: MetricRule[] = []
export const metricRules = createReducer(
    defaultMetricRules,
    on(setMetricRules, setState(defaultMetricRules)),
    on(addMetricRule, (state, action) => (state.some(rule => rule.id === action.rule.id) ? state : [...state, action.rule])),
    on(removeMetricRule, (state, action) => state.filter(rule => rule.id !== action.id))
)
