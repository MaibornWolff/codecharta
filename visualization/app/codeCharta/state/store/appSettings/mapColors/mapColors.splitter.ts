import { MapColorsAction, setMapColors } from "./mapColors.actions"
import { MapColors } from "../../../../codeCharta.model"

export function splitMapColorsAction(payload: MapColors): MapColorsAction {
	return setMapColors(payload)
}
