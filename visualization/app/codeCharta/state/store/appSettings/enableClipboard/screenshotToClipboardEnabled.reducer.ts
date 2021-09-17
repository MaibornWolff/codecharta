import {
	ScreenshotToClipboardEnabledAction,
	ScreenshotToClipboardEnabledActions,
	setScreenshotToClipboardEnabled
} from "./screenshotToClipboardEnabled.actions"

export function screenshotToClipboardEnabled(
	state = setScreenshotToClipboardEnabled().payload,
	action: ScreenshotToClipboardEnabledAction
) {
	switch (action.type) {
		case ScreenshotToClipboardEnabledActions.SET_SCREENSHOT_TO_CLIPBOARD_ENABLED:
			return action.payload
		default:
			return state
	}
}
