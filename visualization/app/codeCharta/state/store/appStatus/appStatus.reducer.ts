import { combineReducers } from "@ngrx/store"
import {
    defaultCurrentFilesAreSampleFiles,
    currentFilesAreSampleFiles
} from "../../../fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.reducer"

export const appStatus = combineReducers({
    currentFilesAreSampleFiles
})

export const defaultAppStatus = {
    currentFilesAreSampleFiles: defaultCurrentFilesAreSampleFiles
}
