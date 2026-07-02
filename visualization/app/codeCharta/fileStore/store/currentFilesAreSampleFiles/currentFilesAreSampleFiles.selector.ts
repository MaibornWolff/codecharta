import { createSelector } from "@ngrx/store"
import { appStatusSelector } from "../../../state/store/appStatus/appStatus.selector"

export const currentFilesAreSampleFilesSelector = createSelector(appStatusSelector, appStatus => appStatus.currentFilesAreSampleFiles)
