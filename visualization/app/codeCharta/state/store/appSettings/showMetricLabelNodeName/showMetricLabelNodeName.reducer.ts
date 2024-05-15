import { createReducer, on } from "@ngrx/store"
import { setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultShowMetricLabelNodeName = true
export const showMetricLabelNodeName = createReducer(
    defaultShowMetricLabelNodeName,
    on(setShowMetricLabelNodeName, setState(defaultShowMetricLabelNodeName))
)
