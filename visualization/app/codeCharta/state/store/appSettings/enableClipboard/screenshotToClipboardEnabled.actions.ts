import { CCAction } from "../../../../codeCharta.model"

export enum ScreenshotToClipboardEnabledActions {
	SET_SCREENSHOT_TO_CLIPBOARD_ENABLED = "SET_SCREENSHOT_TO_CLIPBOARD_ENABLED"
}

export interface SetScreenshotToClipboardEnabledAction extends CCAction {
	type: ScreenshotToClipboardEnabledActions.SET_SCREENSHOT_TO_CLIPBOARD_ENABLED
	payload: boolean
}

export type ScreenshotToClipboardEnabledAction = SetScreenshotToClipboardEnabledAction

export function setScreenshotToClipboardEnabled(
	screenshotToClipboardEnabled: boolean = defaultScreenshotToClipboardEnabled
): SetScreenshotToClipboardEnabledAction {
	return {
		type: ScreenshotToClipboardEnabledActions.SET_SCREENSHOT_TO_CLIPBOARD_ENABLED,
		payload: screenshotToClipboardEnabled
	}
}

export const defaultScreenshotToClipboardEnabled = false
