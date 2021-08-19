import { CCAction } from "../../codeCharta.model"

export enum ClipboardEnabledActions {
	SET_CLIPBOARD_ENABLED = "SET_CLIPBOARD_ENABLED"
}

export interface SetClipboardEnabledAction extends CCAction {
	type: ClipboardEnabledActions.SET_CLIPBOARD_ENABLED
	payload: boolean
}

export type ClipboardEnabledAction = SetClipboardEnabledAction

export function setClipboardEnabled(clipboardEnabled: boolean = defaultClipboardEnabled): SetClipboardEnabledAction {
	return {
		type: ClipboardEnabledActions.SET_CLIPBOARD_ENABLED,
		payload: clipboardEnabled
	}
}

export const defaultClipboardEnabled = false
