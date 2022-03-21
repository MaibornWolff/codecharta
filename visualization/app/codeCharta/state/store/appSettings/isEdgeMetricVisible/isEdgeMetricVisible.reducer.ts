import { IsEdgeMetricVisibleActions, IsEdgeMetricVisibleAction, defaultIsEdgeMetricVisible } from "./isEdgeMetricVisible.actions"

export function isEdgeMetricVisible(state = defaultIsEdgeMetricVisible, action: IsEdgeMetricVisibleAction) {
	switch (action.type) {
		case IsEdgeMetricVisibleActions.SET_IS_EDGE_METRIC_VISIBLE:
			return !state
		default:
			return state
	}
}
