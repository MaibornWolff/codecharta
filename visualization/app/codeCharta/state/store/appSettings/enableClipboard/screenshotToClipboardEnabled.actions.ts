import { createAction, props } from "@ngrx/store"

export const setScreenshotToClipboardEnabled = createAction("SET_SCREENSHOT_TO_CLIPBOARD_ENABLED", props<{ value: boolean }>())
