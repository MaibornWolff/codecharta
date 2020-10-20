import { Action } from "redux"

export enum ShowMetricLabelNodeNameActions {
	SET_SHOW_METRIC_LABEL_NODE_NAME = "SET_SHOW_METRIC_LABEL_NODE_NAME"
}

export interface SetShowMetricLabelNodeNameAction extends Action {
	type: ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME
	payload: boolean
}

export type ShowMetricLabelNodeNameAction = SetShowMetricLabelNodeNameAction

export function setShowMetricLabelNodeName(
	showMetricLabelNodeName: boolean = defaultShowMetricLabelNodeName
): SetShowMetricLabelNodeNameAction {
	return {
		type: ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME,
		payload: showMetricLabelNodeName
	}
}

export const defaultShowMetricLabelNodeName = true
