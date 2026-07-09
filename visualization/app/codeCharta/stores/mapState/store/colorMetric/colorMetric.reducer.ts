import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setColorMetric } from "./colorMetric.actions"

export const defaultColorMetric: null | string = null
export const colorMetric = createReducer(defaultColorMetric, on(setColorMetric, setState(defaultColorMetric)))
