import { ColorModeAction, setColorMode } from "./colorMode.actions"
import { ColorMode } from "../../../../codeCharta.model"

export function splitColorModeAction(payload: ColorMode): ColorModeAction {
	return setColorMode(payload)
}
