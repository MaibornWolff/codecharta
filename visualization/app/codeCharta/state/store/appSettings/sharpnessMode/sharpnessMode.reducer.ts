import { SharpnessModeAction, SharpnessModeActions, setSharpnessMode } from "./sharpnessMode.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

export function sharpnessMode(state: SharpnessMode = setSharpnessMode().payload, action: SharpnessModeAction): SharpnessMode {
	switch (action.type) {
		case SharpnessModeActions.SET_SHARPNESS_MODE:
			return action.payload
		default:
			return state
	}
}
