import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const experimentalFeaturesEnabledSelector = createSelector(
    preferencesSelector,
    preferences => preferences.experimentalFeaturesEnabled
)
