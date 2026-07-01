import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../../../state/store/appSettings/appSettings.selector"

export const amountOfTopLabelsSelector = createSelector(appSettingsSelector, appSettings => appSettings.amountOfTopLabels)
