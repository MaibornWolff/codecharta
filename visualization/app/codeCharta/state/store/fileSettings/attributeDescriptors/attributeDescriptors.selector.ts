import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../fileSettings.selector"

export const attributeDescriptorsSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeDescriptors)
