import { createReducer, on } from "@ngrx/store"
import { setIsLoadingFile } from "./isLoadingFile.actions"

export const defaultIsLoadingFile = true
export const isLoadingFile = createReducer(
	defaultIsLoadingFile,
	on(setIsLoadingFile, (_state, action) => action.value)
)
