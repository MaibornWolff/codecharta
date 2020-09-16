import { setPresentationMode } from "./isPresentationMode.actions"

export function splitIsPresentationModeAction(payload: boolean) {
	return setPresentationMode(payload)
}
