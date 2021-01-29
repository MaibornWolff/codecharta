import { SharpnessAction, setSharpnessMode } from "./sharpness.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

export function splitSharpnessAction(payload: SharpnessMode): SharpnessAction {
	return setSharpnessMode(payload)
}
