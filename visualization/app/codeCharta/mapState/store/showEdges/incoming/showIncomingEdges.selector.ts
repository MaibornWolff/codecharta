import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../../state/store/appSettings/appSettings.selector"

export const showIncomingEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showIncomingEdges)
