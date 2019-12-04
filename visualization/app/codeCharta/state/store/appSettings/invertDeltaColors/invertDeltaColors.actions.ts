import { CCAction } from "../../../../codeCharta.model"

export enum InvertDeltaColorsActions {
	SET_INVERT_DELTA_COLORS = "SET_INVERT_DELTA_COLORS"
}

export interface SetInvertDeltaColorsAction extends CCAction {
	type: InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS
	payload: boolean
}

export type InvertDeltaColorsAction = SetInvertDeltaColorsAction

export function setInvertDeltaColors(invertDeltaColors: boolean = false): SetInvertDeltaColorsAction {
	return {
		type: InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS,
		payload: invertDeltaColors
	}
}
