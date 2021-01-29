import { SharpnessAction, SharpnessActions, setSharpnessMode } from "./sharpness.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

export function sharpnessMode(state: SharpnessMode = setSharpnessMode().payload, action: SharpnessAction): SharpnessMode {
	switch (action.type) {
		case SharpnessActions.SET_SHARPNESS_MODE:
			return action.payload
		default:
			return state
	}
}
