import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../../../../state/store/fileSettings/fileSettings.selector"

export const attributeTypesSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeTypes)
