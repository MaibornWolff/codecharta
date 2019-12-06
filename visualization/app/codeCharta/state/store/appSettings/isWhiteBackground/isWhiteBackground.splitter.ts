import { IsWhiteBackgroundAction, setIsWhiteBackground } from "./isWhiteBackground.actions"

export function splitIsWhiteBackgroundAction(payload: boolean): IsWhiteBackgroundAction {
	return setIsWhiteBackground(payload)
}
