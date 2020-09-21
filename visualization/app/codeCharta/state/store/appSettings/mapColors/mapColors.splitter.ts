import { setMapColors } from "./mapColors.actions"
import { MapColors } from "../../../../codeCharta.model"

export function splitMapColorsAction(payload: MapColors) {
	return setMapColors(payload)
}
