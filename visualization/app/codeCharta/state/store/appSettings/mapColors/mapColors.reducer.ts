import { MapColorsAction, MapColorsActions } from "./mapColors.actions"
import _ from "lodash"
import { MapColors } from "../../../../codeCharta.model"

export const defaultMapColors: MapColors = {
	positive: "#69AE40",
	neutral: "#ddcc00",
	negative: "#820E0E",
	selected: "#EB8319",
	defaultC: "#89ACB4",
	positiveDelta: "#69FF40",
	negativeDelta: "#ff0E0E",
	base: "#666666",
	flat: "#AAAAAA",
	lightGrey: "#DDDDDD",
	angularGreen: "#00BFA5",
	markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff", "#FFFF1D"],
	incomingEdge: "#00ffff",
	outgoingEdge: "#ff00ff"
}

export function mapColors(state: MapColors = defaultMapColors, action: MapColorsAction): MapColors {
	switch (action.type) {
		case MapColorsActions.SET_MAP_COLORS:
			return _.cloneDeep(action.payload)
		default:
			return state
	}
}
