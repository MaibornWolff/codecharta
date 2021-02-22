import { SharpnessModeAction, setSharpnessMode } from "./sharpnessMode.actions"
import { SharpnessMode } from "../../../../codeCharta.model"

export function splitSharpnessAction(payload: SharpnessMode): SharpnessModeAction {
	return setSharpnessMode(payload)
}
