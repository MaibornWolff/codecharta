import { Action } from "redux"
import { colorLabelOptions } from "../../../../codeCharta.model"

export enum ColorLabelsActions {
	SET_COLOR_LABELS = "SET_COLOR_LABELS"
}

export interface SetColorLabelsAction extends Action {
	type: ColorLabelsActions.SET_COLOR_LABELS
	payload: Partial<colorLabelOptions>
}

export type ColorLabelsAction = SetColorLabelsAction

export function setColorLabels(colorLabels: Partial<colorLabelOptions> = defaultColorLabels): SetColorLabelsAction {
	return {
		type: ColorLabelsActions.SET_COLOR_LABELS,
		payload: colorLabels
	}
}

export const defaultColorLabels: colorLabelOptions = {
	positive: false,
	negative: false,
	neutral: false
}
