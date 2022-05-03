import { CCAction, MapColors } from "../../../../codeCharta.model"

export enum MapColorsActions {
	SET_MAP_COLORS = "SET_MAP_COLORS"
}

export interface SetMapColorsAction extends CCAction {
	type: MapColorsActions.SET_MAP_COLORS
	payload: Partial<MapColors>
}

export type MapColorsAction = SetMapColorsAction

export function setMapColors(mapColors: Partial<MapColors> = defaultMapColors): SetMapColorsAction {
	return {
		type: MapColorsActions.SET_MAP_COLORS,
		payload: mapColors
	}
}

export const defaultMapColors: MapColors = {
	positive: "#69AE40",
	neutral: "#ddcc00",
	negative: "#820E0E",
	selected: "#EB8319",
	defaultC: "#89ACB4",
	positiveDelta: "#64d051",
	negativeDelta: "#ff0E0E",
	base: "#666666",
	flat: "#AAAAAA",
	angularGreen: "#00BFA5",
	markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff"],
	incomingEdge: "#00ffff",
	outgoingEdge: "#ff00ff",
	labelColorAndAlpha: { rgb: "#e0e0e0", alpha: 0.7 }
}
