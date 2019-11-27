import { IsWhiteBackgroundAction, IsWhiteBackgroundActions } from "./isWhiteBackground.actions"

export function isWhiteBackground(state: boolean = false, action: IsWhiteBackgroundAction): boolean {
	switch (action.type) {
		case IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND:
			return action.payload
		default:
			return state
	}
}
