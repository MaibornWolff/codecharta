import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setHeightMetric } from "./heightMetric.actions"

export const defaultHeightMetric: null | string = null
export const heightMetric = createReducer(defaultHeightMetric, on(setHeightMetric, setState(defaultHeightMetric)))
