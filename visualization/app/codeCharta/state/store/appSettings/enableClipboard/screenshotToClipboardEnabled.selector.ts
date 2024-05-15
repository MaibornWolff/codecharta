import { createSelector } from "@ngrx/store"
import { appSettingsSelector } from "../appSettings.selector"

export const screenshotToClipboardEnabledSelector = createSelector(
    appSettingsSelector,
    appSettings => appSettings.screenshotToClipboardEnabled
)
