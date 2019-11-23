import { PresentationModeAction, PresentationModeActions } from "./isPresentationMode.actions"

export function isPresentationMode(state: boolean = false, action: PresentationModeAction): boolean {
	switch (action.type) {
		case PresentationModeActions.SET_PRESENTATION_MODE:
			return action.payload
		default:
			return state
	}
}
