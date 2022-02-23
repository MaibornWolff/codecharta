import { Action } from "redux"

export enum IsEdgeMetricVisibleActions {
	SET_IS_EDGE_METRIC_VISIBLE = "SET_IS_EDGE_METRIC_VISIBLE"
}

export interface SetIsEdgeMetricVisibleAction extends Action {
	type: IsEdgeMetricVisibleActions.SET_IS_EDGE_METRIC_VISIBLE
}

export type IsEdgeMetricVisibleAction = SetIsEdgeMetricVisibleAction

export function setIsEdgeMetricVisible(): SetIsEdgeMetricVisibleAction {
	return {
		type: IsEdgeMetricVisibleActions.SET_IS_EDGE_METRIC_VISIBLE
	}
}

export const defaultIsEdgeMetricVisible = true
