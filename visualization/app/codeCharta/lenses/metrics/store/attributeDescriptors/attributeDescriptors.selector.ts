import { createSelector } from "@ngrx/store"
import { fileSettingsSelector } from "../../../../state/store/fileSettings/fileSettings.selector"

export const attributeDescriptorsSelector = createSelector(fileSettingsSelector, fileSettings => fileSettings.attributeDescriptors)
