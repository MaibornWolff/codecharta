import { setScreenshotToClipboardEnabled } from "./screenshotToClipboardEnabled.actions"

export function splitScreenshotToClipboardEnabledAction(payload: boolean) {
	return setScreenshotToClipboardEnabled(payload)
}
