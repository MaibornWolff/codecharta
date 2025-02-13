import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../appSettings.selector"

export const showIncomingEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showIncomingEdges)
