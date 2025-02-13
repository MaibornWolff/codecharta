import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../appSettings.selector"

export const showOutgoingEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showOutgoingEdges)
