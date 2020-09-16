import { EdgeMetricAction, EdgeMetricActions, setEdgeMetric } from "./edgeMetric.actions"

export function edgeMetric(state = setEdgeMetric().payload, action: EdgeMetricAction) {
	switch (action.type) {
		case EdgeMetricActions.SET_EDGE_METRIC:
			return action.payload
		default:
			return state
	}
}
