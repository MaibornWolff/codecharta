import { createReducer, on } from "@ngrx/store"
import { setAreaMetric } from "./areaMetric.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultAreaMetric: null | string = null
export const areaMetric = createReducer(defaultAreaMetric, on(setAreaMetric, setState(defaultAreaMetric)))
