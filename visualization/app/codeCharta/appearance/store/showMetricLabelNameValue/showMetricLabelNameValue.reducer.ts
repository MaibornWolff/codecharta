import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultShowMetricLabelNameValue = false
export const showMetricLabelNameValue = createReducer(
    defaultShowMetricLabelNameValue,
    on(setShowMetricLabelNameValue, setState(defaultShowMetricLabelNameValue))
)
