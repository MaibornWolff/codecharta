import { toggleEdgeMetric, ToggleEdgeMetricActions, ToggleEdgeMetricAction } from "./toggleEdgeMetric.actions"

export function edgeMetricToggler(state = toggleEdgeMetric().payload, action: ToggleEdgeMetricAction) {
	switch (action.type) {
		case ToggleEdgeMetricActions.TOGGLE_EDGE_METRIC:
			return !state
		default:
			return state
	}
}
