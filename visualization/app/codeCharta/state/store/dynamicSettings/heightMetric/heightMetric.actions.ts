import { Action } from "redux"

export enum HeightMetricActions {
	SET_HEIGHT_METRIC = "SET_HEIGHT_METRIC"
}

export interface SetHeightMetricAction extends Action {
	type: HeightMetricActions.SET_HEIGHT_METRIC
	payload: string
}

export type HeightMetricAction = SetHeightMetricAction

export function setHeightMetric(heightMetric: string): HeightMetricAction {
	return {
		type: HeightMetricActions.SET_HEIGHT_METRIC,
		payload: heightMetric
	}
}
