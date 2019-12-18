import { PresentationModeAction, setPresentationMode } from "./isPresentationMode.actions"

export function splitIsPresentationModeAction(payload: boolean): PresentationModeAction {
	return setPresentationMode(payload)
}
