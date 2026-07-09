import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

export const defaultShowMetricLabelNameValue = false
export const showMetricLabelNameValue = createReducer(
    defaultShowMetricLabelNameValue,
    on(setShowMetricLabelNameValue, setState(defaultShowMetricLabelNameValue))
)
