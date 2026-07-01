import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const amountOfEdgePreviewsSelector = createSelector(appSettingsSelector, appSettings => appSettings.amountOfEdgePreviews)
