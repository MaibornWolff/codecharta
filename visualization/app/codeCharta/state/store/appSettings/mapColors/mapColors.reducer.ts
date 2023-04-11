import { createReducer, on } from "@ngrx/store"
import { MapColors } from "../../../../codeCharta.model"
import { invertColorRange, invertDeltaColors, setMapColors } from "./mapColors.actions"

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

export const mapColors = createReducer(
	defaultMapColors,
	on(setMapColors, (state, action) => ({ ...state, ...action.value })),
	on(invertColorRange, state => ({ ...state, positive: state.negative, negative: state.positive })),
	on(invertDeltaColors, state => ({ ...state, positiveDelta: state.negativeDelta, negativeDelta: state.positiveDelta }))
)
