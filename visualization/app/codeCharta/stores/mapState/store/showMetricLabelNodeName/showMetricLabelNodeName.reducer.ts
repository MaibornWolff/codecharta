import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

export const defaultShowMetricLabelNodeName = true
export const showMetricLabelNodeName = createReducer(
    defaultShowMetricLabelNodeName,
    on(setShowMetricLabelNodeName, setState(defaultShowMetricLabelNodeName))
)
