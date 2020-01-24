import { MapColorsAction, setMapColors } from "./mapColors.actions"
import { MapColors } from "../../../../model/codeCharta.model"

export function splitMapColorsAction(payload: MapColors): MapColorsAction {
	return setMapColors(payload)
}
