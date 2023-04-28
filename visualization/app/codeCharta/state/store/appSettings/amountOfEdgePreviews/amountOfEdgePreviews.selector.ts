import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const amountOfEdgePreviewsSelector = createSelector(appSettingsSelector, appSettings => appSettings.amountOfEdgePreviews)
