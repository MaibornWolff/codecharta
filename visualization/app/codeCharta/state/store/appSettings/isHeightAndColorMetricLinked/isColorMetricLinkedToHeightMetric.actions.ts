import { Action } from "redux"

export enum IsColorMetricLinkedToHeightMetricActions {
	TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC = "TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC",
	SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC = "SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC"
}

export interface ToggleHeightAndColorMetricLinkedAction extends Action {
	type: IsColorMetricLinkedToHeightMetricActions.TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC
}

export interface SetIsColorMetricLinkedToHeightMetricAction extends Action {
	type: IsColorMetricLinkedToHeightMetricActions.SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC
	payload: boolean
}

export type IsColorMetricLinkedToHeightMetricAction = ToggleHeightAndColorMetricLinkedAction | SetIsColorMetricLinkedToHeightMetricAction

export function toggleIsColorMetricLinkedToHeightMetric(): ToggleHeightAndColorMetricLinkedAction {
	return {
		type: IsColorMetricLinkedToHeightMetricActions.TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC
	}
}

export function setIsColorMetricLinkedToHeightMetricAction(payload: boolean): SetIsColorMetricLinkedToHeightMetricAction {
	return {
		type: IsColorMetricLinkedToHeightMetricActions.SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC,
		payload
	}
}

export const defaultIsColorMetricLinkedToHeightMetric = false
