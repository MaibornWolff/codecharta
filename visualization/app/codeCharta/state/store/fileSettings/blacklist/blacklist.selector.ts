import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../fileSettings.selector"

export const blacklistSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.blacklist)
