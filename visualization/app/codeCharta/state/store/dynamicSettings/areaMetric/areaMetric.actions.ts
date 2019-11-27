import { Action } from "redux"

export enum AreaMetricActions {
	SET_AREA_METRIC = "SET_AREA_METRIC"
}

export interface SetAreaMetricAction extends Action {
	type: AreaMetricActions.SET_AREA_METRIC
	payload: string
}

export type AreaMetricAction = SetAreaMetricAction

export function setAreaMetric(areaMetric: string): AreaMetricAction {
	return {
		type: AreaMetricActions.SET_AREA_METRIC,
		payload: areaMetric
	}
}
