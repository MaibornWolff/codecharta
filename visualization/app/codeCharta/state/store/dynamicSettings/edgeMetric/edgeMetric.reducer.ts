import { EdgeMetricAction, EdgeMetricActions, setEdgeMetric } from "./edgeMetric.actions"

export function edgeMetric(state: string = setEdgeMetric().payload, action: EdgeMetricAction): string {
	switch (action.type) {
		case EdgeMetricActions.SET_EDGE_METRIC:
			return action.payload
		default:
			return state
	}
}
