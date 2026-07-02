import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const edgeHeightSelector = createSelector(appSettingsSelector, appSettings => appSettings.edgeHeight)
