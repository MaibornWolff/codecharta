import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setDistributionMetric } from "./distributionMetric.actions"

export const defaultDistributionMetric: null | string = null
export const distributionMetric = createReducer(defaultDistributionMetric, on(setDistributionMetric, setState(defaultDistributionMetric)))
