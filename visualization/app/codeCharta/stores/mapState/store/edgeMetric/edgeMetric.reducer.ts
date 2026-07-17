import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setEdgeMetric } from "./edgeMetric.actions"

export const defaultEdgeMetric: null | string = null
export const edgeMetric = createReducer(defaultEdgeMetric, on(setEdgeMetric, setState(defaultEdgeMetric)))
