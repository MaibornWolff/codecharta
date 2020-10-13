import { Action } from "redux"

export enum ShowLabelMetricNameValueActions {
	SET_SHOW_LABEL_METRIC_NAME_VALUE = "SET_SHOW_LABEL_METRIC_NAME_VALUE"
}

export interface SetShowLabelMetricNameValueAction extends Action {
	type: ShowLabelMetricNameValueActions.SET_SHOW_LABEL_METRIC_NAME_VALUE
	payload: boolean
}

export type ShowLabelMetricNameValueAction = SetShowLabelMetricNameValueAction

export function setShowLabelMetricNameValue(showLabelMetricNameValue: boolean = defaultShowLabelMetricNameValue): SetShowLabelMetricNameValueAction {
	return {
		type: ShowLabelMetricNameValueActions.SET_SHOW_LABEL_METRIC_NAME_VALUE,
		payload: showLabelMetricNameValue
	}
}

export const defaultShowLabelMetricNameValue : boolean = true
