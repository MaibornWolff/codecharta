import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setIsLoadingFile } from "./isLoadingFile.actions"

export const defaultIsLoadingFile = true
export const isLoadingFile = createReducer(defaultIsLoadingFile, on(setIsLoadingFile, setState(defaultIsLoadingFile)))
