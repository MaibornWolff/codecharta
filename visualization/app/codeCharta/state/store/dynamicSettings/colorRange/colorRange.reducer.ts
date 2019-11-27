import { ColorRangeAction, ColorRangeActions } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"
import _ from "lodash"

export function colorRange(state: ColorRange = { from: null, to: null }, action: ColorRangeAction): ColorRange {
	switch (action.type) {
		case ColorRangeActions.SET_COLOR_RANGE:
			return _.cloneDeep(action.payload)
		default:
			return state
	}
}
