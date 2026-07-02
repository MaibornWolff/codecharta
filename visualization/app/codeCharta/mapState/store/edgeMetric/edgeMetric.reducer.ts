import { createReducer, on } from "@ngrx/store"
import { setEdgeMetric } from "./edgeMetric.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultEdgeMetric: null | string = null
export const edgeMetric = createReducer(defaultEdgeMetric, on(setEdgeMetric, setState(defaultEdgeMetric)))
