import { Action } from "redux"

export enum EdgeMetricActions {
	SET_EDGE_METRIC = "SET_EDGE_METRIC"
}

export interface SetEdgeMetricAction extends Action {
	type: EdgeMetricActions.SET_EDGE_METRIC
	payload: string
}

export type EdgeMetricAction = SetEdgeMetricAction

export function setEdgeMetric(edgeMetric: string): EdgeMetricAction {
	return {
		type: EdgeMetricActions.SET_EDGE_METRIC,
		payload: edgeMetric
	}
}
