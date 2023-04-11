import { setIsLoadingMap } from "./isLoadingMap.actions"
import { createReducer, on } from "@ngrx/store"

export const defaultIsLoadingMap = true
export const isLoadingMap = createReducer(
	defaultIsLoadingMap,
	on(setIsLoadingMap, (_state, action) => action.value)
)
