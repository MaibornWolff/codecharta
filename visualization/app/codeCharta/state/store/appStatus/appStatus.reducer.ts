import { combineReducers } from "@ngrx/store"
import {
    defaultCurrentFilesAreSampleFiles,
    currentFilesAreSampleFiles
} from "./currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"

export const appStatus = combineReducers({
    currentFilesAreSampleFiles
})

export const defaultAppStatus = {
    currentFilesAreSampleFiles: defaultCurrentFilesAreSampleFiles
}
