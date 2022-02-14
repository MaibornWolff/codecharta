import { Action } from "redux"

export enum ToggleEdgeMetricActions {
	TOGGLE_EDGE_METRIC = "TOGGLE_EDGE_METRIC"
}

export interface ToggleEdgeMetricAction extends Action {
	type: ToggleEdgeMetricActions.TOGGLE_EDGE_METRIC
	payload: boolean
}

export type EdgeMetricToggleAction = ToggleEdgeMetricAction

export function toggleEdgeMetric(toggleEdgeMetric: boolean = defaultToggleEdgeMetric): ToggleEdgeMetricAction {
	return {
		type: ToggleEdgeMetricActions.TOGGLE_EDGE_METRIC,
		payload: toggleEdgeMetric
	}
}

export const defaultToggleEdgeMetric = false
