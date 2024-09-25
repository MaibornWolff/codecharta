import { createReducer, on } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { setCurrentFilesAreSampleFiles } from "./currentFilesAreSampleFiles.actions"

export const defaultCurrentFilesAreSampleFiles: CcState["appStatus"]["currentFilesAreSampleFiles"] = false
export const currentFilesAreSampleFiles = createReducer(
    defaultCurrentFilesAreSampleFiles,
    on(setCurrentFilesAreSampleFiles, (_state, action) => action.value)
)
