import { MapColors } from "../../../../codeCharta.model"

export enum MapColorsActions {
	SET_MAP_COLORS = "SET_MAP_COLORS",
	INVERT_COLOR_RANGE = "INVERT_COLOR_RANGE",
	INVERT_DELTA_COLORS = "INVERT_DELTA_COLORS"
}

export type MapColorsAction = ReturnType<typeof setMapColors> | ReturnType<typeof invertColorRange> | ReturnType<typeof invertDeltaColors>

export function setMapColors(mapColors: Partial<MapColors> = defaultMapColors) {
	return {
		type: MapColorsActions.SET_MAP_COLORS,
		payload: mapColors
	}
}

export function invertColorRange() {
	return {
		type: MapColorsActions.INVERT_COLOR_RANGE
	}
}

export function invertDeltaColors() {
	return {
		type: MapColorsActions.INVERT_DELTA_COLORS
	}
}

export const defaultMapColors: MapColors = {
	positive: "#69AE40",
	neutral: "#ddcc00",
	negative: "#820E0E",
	selected: "#EB8319",
	positiveDelta: "#64d051",
	negativeDelta: "#ff0E0E",
	base: "#666666",
	flat: "#AAAAAA",
	markingColors: ["#FF1D8E", "#1d8eff", "#1DFFFF", "#8eff1d", "#8e1dff"],
	incomingEdge: "#00ffff",
	outgoingEdge: "#ff00ff",
	labelColorAndAlpha: { rgb: "#e0e0e0", alpha: 0.7 }
}
