import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../appStatus.selector"

export const currentFilesAreSampleFilesSelector = createSelector(appStatusSelector, appStatus => appStatus.currentFilesAreSampleFiles)
