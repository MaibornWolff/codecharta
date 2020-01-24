import { CCAction } from "../../../../model/codeCharta.model"

export enum AreaMetricActions {
	SET_AREA_METRIC = "SET_AREA_METRIC"
}

export interface SetAreaMetricAction extends CCAction {
	type: AreaMetricActions.SET_AREA_METRIC
	payload: string
}

export type AreaMetricAction = SetAreaMetricAction

export function setAreaMetric(areaMetric: string = defaultAreaMetric): SetAreaMetricAction {
	return {
		type: AreaMetricActions.SET_AREA_METRIC,
		payload: areaMetric
	}
}

export const defaultAreaMetric = null
