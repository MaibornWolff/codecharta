import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../../../state/store/fileSettings/fileSettings.selector"

export const markedPackagesSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.markedPackages)
