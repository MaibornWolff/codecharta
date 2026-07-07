import { createReducer, on } from "@ngrx/store"
import { setCurrentFilesAreSampleFiles } from "./currentFilesAreSampleFiles.actions"

export const defaultCurrentFilesAreSampleFiles = false
export const currentFilesAreSampleFiles = createReducer(
    defaultCurrentFilesAreSampleFiles,
    on(setCurrentFilesAreSampleFiles, (_state, action) => action.value)
)
