import { Action } from "redux"

export enum IsEdgeMetricVisibleActions {
	TOGGLE_IS_EDGE_METRIC_VISIBLE = "TOGGLE_IS_EDGE_METRIC_VISIBLE"
}

export interface ToggleIsEdgeMetricVisibleAction extends Action {
	type: IsEdgeMetricVisibleActions.TOGGLE_IS_EDGE_METRIC_VISIBLE
}

export type IsEdgeMetricVisibleAction = ToggleIsEdgeMetricVisibleAction

export function toggleEdgeMetricVisible(): ToggleIsEdgeMetricVisibleAction {
	return {
		type: IsEdgeMetricVisibleActions.TOGGLE_IS_EDGE_METRIC_VISIBLE
	}
}

export const defaultIsEdgeMetricVisible = true
