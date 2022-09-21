import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const amountOfTopLabelsSelector = createSelector([appSettingsSelector], appSettings => appSettings.amountOfTopLabels)
