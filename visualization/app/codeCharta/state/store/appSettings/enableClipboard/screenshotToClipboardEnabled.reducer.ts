import { createReducer, on } from "@ngrx/store"
import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"

export const screenshotToClipboardEnabled = createReducer(
	false,
	on(setScreenshotToClipboardEnabled, (_state, payload) => payload.value)
)
