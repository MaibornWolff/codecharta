import { createReducer, on } from "@ngrx/store"
import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultScreenshotToClipboardEnabled = false
export const screenshotToClipboardEnabled = createReducer(
	defaultScreenshotToClipboardEnabled,
	on(setScreenshotToClipboardEnabled, setState(defaultScreenshotToClipboardEnabled))
)
