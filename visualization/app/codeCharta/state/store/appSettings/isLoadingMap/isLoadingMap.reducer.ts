import { setState } from "../../util/setState.reducer.factory"
import { setIsLoadingMap } from "./isLoadingMap.actions"
import { createReducer, on } from "@ngrx/store"

export const defaultIsLoadingMap = true
export const isLoadingMap = createReducer(defaultIsLoadingMap, on(setIsLoadingMap, setState(defaultIsLoadingMap)))
