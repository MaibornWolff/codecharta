import { Action } from "redux"

export enum ShowLabelMetricActions {
	SET_SHOW_LABEL_METRIC = "SET_SHOW_LABEL_METRIC"
}

export interface SetShowLabelMetricAction extends Action {
	type: ShowLabelMetricActions.SET_SHOW_LABEL_METRIC
	payload: boolean
}

export type ShowLabelMetricAction = SetShowLabelMetricAction

export function setShowLabelMetric(showLabelMetric: boolean = defaultShowLabelMetric): SetShowLabelMetricAction {
	return {
		type: ShowLabelMetricActions.SET_SHOW_LABEL_METRIC,
		payload: showLabelMetric
	}
}

export const defaultShowLabelMetric : boolean = true
