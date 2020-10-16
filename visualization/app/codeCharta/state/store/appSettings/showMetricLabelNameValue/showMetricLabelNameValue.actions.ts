import { Action } from "redux"

export enum ShowMetricLabelNameValueActions {
	SET_SHOW_METRIC_LABEL_NAME_VALUE = "SET_SHOW_METRIC_LABEL_NAME_VALUE"
}

export interface SetShowMetricLabelNameValueAction extends Action {
	type: ShowMetricLabelNameValueActions.SET_SHOW_METRIC_LABEL_NAME_VALUE
	payload: boolean
}

export type ShowMetricLabelNameValueAction = SetShowMetricLabelNameValueAction

export function setShowMetricLabelNameValue(
	showMetricLabelNameValue: boolean = defaultShowMetricLabelNameValue
): SetShowMetricLabelNameValueAction {
	return {
		type: ShowMetricLabelNameValueActions.SET_SHOW_METRIC_LABEL_NAME_VALUE,
		payload: showMetricLabelNameValue
	}
}

export const defaultShowMetricLabelNameValue = true
