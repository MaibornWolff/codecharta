import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setLabelsPerMap } from "./labelsPerMap.actions"

export const defaultLabelsPerMap = false
export const labelsPerMap = createReducer(defaultLabelsPerMap, on(setLabelsPerMap, setState(defaultLabelsPerMap)))
