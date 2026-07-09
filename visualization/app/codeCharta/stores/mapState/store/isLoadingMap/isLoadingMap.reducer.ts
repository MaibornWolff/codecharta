import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setIsLoadingMap } from "./isLoadingMap.actions"

export const defaultIsLoadingMap = true
export const isLoadingMap = createReducer(defaultIsLoadingMap, on(setIsLoadingMap, setState(defaultIsLoadingMap)))
