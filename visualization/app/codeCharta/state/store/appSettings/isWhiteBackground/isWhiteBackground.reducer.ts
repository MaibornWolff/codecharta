import { IsWhiteBackgroundAction, IsWhiteBackgroundActions, setIsWhiteBackground } from "./isWhiteBackground.actions"

export function isWhiteBackground(state = setIsWhiteBackground().payload, action: IsWhiteBackgroundAction) {
	switch (action.type) {
		case IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND:
			return action.payload
		default:
			return state
	}
}
