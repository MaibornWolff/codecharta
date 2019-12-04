import { CCAction } from "../../../../codeCharta.model"

export enum EdgeMetricActions {
	SET_EDGE_METRIC = "SET_EDGE_METRIC"
}

export interface SetEdgeMetricAction extends CCAction {
	type: EdgeMetricActions.SET_EDGE_METRIC
	payload: string
}

export type EdgeMetricAction = SetEdgeMetricAction

export function setEdgeMetric(edgeMetric: string = null): SetEdgeMetricAction {
	return {
		type: EdgeMetricActions.SET_EDGE_METRIC,
		payload: edgeMetric
	}
}
