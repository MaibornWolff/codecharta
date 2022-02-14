import { toggleEdgeMetric, ToggleEdgeMetricActions, EdgeMetricToggleAction } from "./toggleEdgeMetric.actions"

export function edgeMetricToggler(state = toggleEdgeMetric().payload, action: EdgeMetricToggleAction) {
	switch (action.type) {
		case ToggleEdgeMetricActions.TOGGLE_EDGE_METRIC:
			return !state
		default:
			return state
	}
}
