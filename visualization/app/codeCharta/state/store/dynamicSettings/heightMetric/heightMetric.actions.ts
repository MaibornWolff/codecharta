import { CCAction } from "../../../../codeCharta.model"

export enum HeightMetricActions {
	SET_HEIGHT_METRIC = "SET_HEIGHT_METRIC"
}

export interface SetHeightMetricAction extends CCAction {
	type: HeightMetricActions.SET_HEIGHT_METRIC
	payload: string
}

export type HeightMetricAction = SetHeightMetricAction

export function setHeightMetric(heightMetric: string = defaultHeightMetric): SetHeightMetricAction {
	return {
		type: HeightMetricActions.SET_HEIGHT_METRIC,
		payload: heightMetric
	}
}

export const defaultHeightMetric = null
