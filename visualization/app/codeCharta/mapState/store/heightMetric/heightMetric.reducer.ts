import { createReducer, on } from "@ngrx/store"
import { setHeightMetric } from "./heightMetric.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultHeightMetric: null | string = null
export const heightMetric = createReducer(defaultHeightMetric, on(setHeightMetric, setState(defaultHeightMetric)))
