import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setAreaMetric } from "./areaMetric.actions"

export const defaultAreaMetric: null | string = null
export const areaMetric = createReducer(defaultAreaMetric, on(setAreaMetric, setState(defaultAreaMetric)))
