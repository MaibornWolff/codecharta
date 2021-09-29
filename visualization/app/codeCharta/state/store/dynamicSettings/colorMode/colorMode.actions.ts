import { Action } from "redux"
import { ColorMode } from "../../../../codeCharta.model"

export enum ColorModeActions {
	SET_COLOR_MODE = "SET_COLOR_MODE"
}

export interface SetColorModeAction extends Action {
	type: ColorModeActions.SET_COLOR_MODE
	payload: ColorMode
}

export type ColorModeAction = SetColorModeAction

export function setColorMode(colorMode: ColorMode = defaultColorMode): SetColorModeAction {
	return {
		type: ColorModeActions.SET_COLOR_MODE,
		payload: colorMode
	}
}

export const defaultColorMode: ColorMode = ColorMode.weightedGradient
