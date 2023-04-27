import { createReducer, on } from "@ngrx/store"
import { setDistributionMetric } from "./distributionMetric.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultDistributionMetric: null | string = null
export const distributionMetric = createReducer(defaultDistributionMetric, on(setDistributionMetric, setState(defaultDistributionMetric)))
