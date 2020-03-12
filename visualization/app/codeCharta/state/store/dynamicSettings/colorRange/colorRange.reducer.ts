import { ColorRangeAction, ColorRangeActions, setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"
const clone = require("rfdc")()

export function colorRange(state: ColorRange = setColorRange().payload, action: ColorRangeAction): ColorRange {
	switch (action.type) {
		case ColorRangeActions.SET_COLOR_RANGE:
			return clone(action.payload)
		default:
			return state
	}
}
