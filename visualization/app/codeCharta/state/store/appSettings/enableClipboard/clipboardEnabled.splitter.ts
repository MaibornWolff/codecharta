import { setClipboardEnabled } from "./clipboardEnabled.actions"

export function splitClipboardEnabledAction(payload: boolean) {
	return setClipboardEnabled(payload)
}
