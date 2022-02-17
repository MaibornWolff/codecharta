import { ToggleEdgeMetricActions, EdgeMetricToggleAction, defaultToggleEdgeMetric } from "./toggleEdgeMetric.actions"

export function edgeMetricToggler(state = defaultToggleEdgeMetric, action: EdgeMetricToggleAction) {
	switch (action.type) {
		case ToggleEdgeMetricActions.TOGGLE_EDGE_METRIC:
			return !state
		default:
			return state
	}
}
