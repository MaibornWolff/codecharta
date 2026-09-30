import { createSelector } from "@ngrx/store"
import { hasDependencyDataSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { dependencyViewEnabledSelector } from "../../../stores/preferences/preferences.read.facade"

export const isDependencyViewAvailableSelector = createSelector(
    dependencyViewEnabledSelector,
    hasDependencyDataSelector,
    (isEnabled, hasDependencyData) => isEnabled && hasDependencyData
)
