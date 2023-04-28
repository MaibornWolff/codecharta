import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../fileSettings.selector"

export const attributeTypesSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeTypes)
