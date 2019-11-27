import { EdgeMetricAction, EdgeMetricActions } from "./edgeMetric.actions"

export function edgeMetric(state: string = null, action: EdgeMetricAction): string {
	switch (action.type) {
		case EdgeMetricActions.SET_EDGE_METRIC:
			return action.payload
		default:
			return state
	}
}
