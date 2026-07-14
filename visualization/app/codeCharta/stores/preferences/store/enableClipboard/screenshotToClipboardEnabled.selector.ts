import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

export const screenshotToClipboardEnabledSelector = createSelector(
    preferencesSelector,
    preferences => preferences.screenshotToClipboardEnabled
)
