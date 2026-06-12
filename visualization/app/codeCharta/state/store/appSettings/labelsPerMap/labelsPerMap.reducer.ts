import { createReducer, on } from "@ngrx/store"
import { setLabelsPerMap } from "./labelsPerMap.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultLabelsPerMap = false
export const labelsPerMap = createReducer(defaultLabelsPerMap, on(setLabelsPerMap, setState(defaultLabelsPerMap)))
