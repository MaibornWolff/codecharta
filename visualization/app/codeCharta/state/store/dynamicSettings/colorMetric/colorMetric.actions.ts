import { CCAction } from "../../../../codeCharta.model"

export enum ColorMetricActions {
	SET_COLOR_METRIC = "SET_COLOR_METRIC"
}

export interface SetColorMetricAction extends CCAction {
	type: ColorMetricActions.SET_COLOR_METRIC
	payload: string
}

export type ColorMetricAction = SetColorMetricAction

export function setColorMetric(colorMetric: string = defaultColorMetric): SetColorMetricAction {
	return {
		type: ColorMetricActions.SET_COLOR_METRIC,
		payload: colorMetric
	}
}

export const defaultColorMetric = null
