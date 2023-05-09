import { createReducer, on } from "@ngrx/store"
import { setColorMetric } from "./colorMetric.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultColorMetric: null | string = null
export const colorMetric = createReducer(defaultColorMetric, on(setColorMetric, setState(defaultColorMetric)))
