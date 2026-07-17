import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"

export const defaultScreenshotToClipboardEnabled = false
export const screenshotToClipboardEnabled = createReducer(
    defaultScreenshotToClipboardEnabled,
    on(setScreenshotToClipboardEnabled, setState(defaultScreenshotToClipboardEnabled))
)
