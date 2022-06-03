import { createSelector } from "../../../angular-redux/createSelector"
import { appSettingsSelector } from "../appSettings.selector"

export const amountOfEdgePreviewsSelector = createSelector([appSettingsSelector], appSettings => appSettings.amountOfEdgePreviews)
