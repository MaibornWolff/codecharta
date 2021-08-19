import { ClipboardEnabledAction, ClipboardEnabledActions, setClipboardEnabled } from "./clipboardEnabled.actions"

export function clipboardEnabled(state = setClipboardEnabled().payload, action: ClipboardEnabledAction) {
	switch (action.type) {
		case ClipboardEnabledActions.SET_CLIPBOARD_ENABLED:
			return action.payload
		default:
			return state
	}
}
