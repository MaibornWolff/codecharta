import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../../state/store/appSettings/appSettings.selector"

export const showOutgoingEdgesSelector = createSelector(appSettingsSelector, appSettings => appSettings.showOutgoingEdges)
