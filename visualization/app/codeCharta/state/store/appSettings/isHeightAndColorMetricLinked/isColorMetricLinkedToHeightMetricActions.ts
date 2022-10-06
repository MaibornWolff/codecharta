import { Action } from "redux"

export enum IsColorMetricLinkedToHeightMetricActions {
	TOGGLE_LINK_BETWEEN_COLOR_METRIC_AND_HEIGHT_METRIC = "TOGGLE_LINK_BETWEEN_COLOR_METRIC_AND_HEIGHT_METRIC"
}

export interface ToggleHeightAndColorMetricLinkedAction extends Action {
	type: IsColorMetricLinkedToHeightMetricActions.TOGGLE_LINK_BETWEEN_COLOR_METRIC_AND_HEIGHT_METRIC
}

export type IsColorMetricLinkedToHeightMetricAction = ToggleHeightAndColorMetricLinkedAction

export function toggleLinkBetweenColorMetricAndHeightMetric(): ToggleHeightAndColorMetricLinkedAction {
	return {
		type: IsColorMetricLinkedToHeightMetricActions.TOGGLE_LINK_BETWEEN_COLOR_METRIC_AND_HEIGHT_METRIC
	}
}

export const defaultIsColorMetricLinkedToHeightMetric = false
