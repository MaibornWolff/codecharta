import { createReducer, on } from "@ngrx/store"
import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"

export const defaultScreenshotToClipboardEnabled = false
export const screenshotToClipboardEnabled = createReducer(
	defaultScreenshotToClipboardEnabled,
	on(setScreenshotToClipboardEnabled, (_state, action) => action.value)
)
