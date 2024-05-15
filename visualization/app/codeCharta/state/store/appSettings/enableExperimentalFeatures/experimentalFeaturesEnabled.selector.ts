import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const experimentalFeaturesEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.experimentalFeaturesEnabled
)
