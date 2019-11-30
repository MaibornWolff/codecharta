import { Action } from "redux"

export enum ColorMetricActions {
	SET_COLOR_METRIC = "SET_COLOR_METRIC"
}

export interface SetColorMetricAction extends Action {
	type: ColorMetricActions.SET_COLOR_METRIC
	payload: string
}

export type ColorMetricAction = SetColorMetricAction

export function setColorMetric(colorMetric: string): ColorMetricAction {
	return {
		type: ColorMetricActions.SET_COLOR_METRIC,
		payload: colorMetric
	}
}
