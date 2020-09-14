import { setIsWhiteBackground } from "./isWhiteBackground.actions"

export function splitIsWhiteBackgroundAction(payload: boolean) {
	return setIsWhiteBackground(payload)
}
