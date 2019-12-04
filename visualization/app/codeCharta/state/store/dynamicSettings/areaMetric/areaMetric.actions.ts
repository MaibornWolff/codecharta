import { CCAction } from "../../../../codeCharta.model"

export enum AreaMetricActions {
	SET_AREA_METRIC = "SET_AREA_METRIC"
}

export interface SetAreaMetricAction extends CCAction {
	type: AreaMetricActions.SET_AREA_METRIC
	payload: string
}

export type AreaMetricAction = SetAreaMetricAction

export function setAreaMetric(areaMetric: string = null): AreaMetricAction {
	return {
		type: AreaMetricActions.SET_AREA_METRIC,
		payload: areaMetric
	}
}
