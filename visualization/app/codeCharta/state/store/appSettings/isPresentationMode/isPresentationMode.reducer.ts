import { PresentationModeAction, PresentationModeActions, setPresentationMode } from "./isPresentationMode.actions"

export function isPresentationMode(state: boolean = setPresentationMode().payload, action: PresentationModeAction): boolean {
	switch (action.type) {
		case PresentationModeActions.SET_PRESENTATION_MODE:
			return action.payload
		default:
			return state
	}
}
