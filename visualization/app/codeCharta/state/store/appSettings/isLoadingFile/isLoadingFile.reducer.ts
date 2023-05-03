import { createReducer, on } from "@ngrx/store"
import { setIsLoadingFile } from "./isLoadingFile.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultIsLoadingFile = true
export const isLoadingFile = createReducer(defaultIsLoadingFile, on(setIsLoadingFile, setState(defaultIsLoadingFile)))
