import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../fileSettings.selector"

export const edgesSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.edges)
