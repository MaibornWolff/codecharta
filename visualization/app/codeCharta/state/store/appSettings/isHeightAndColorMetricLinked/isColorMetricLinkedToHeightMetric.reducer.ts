import {
	defaultIsColorMetricLinkedToHeightMetric,
	IsColorMetricLinkedToHeightMetricAction,
	IsColorMetricLinkedToHeightMetricActions
} from "./isColorMetricLinkedToHeightMetric.actions"

export function isColorMetricLinkedToHeightMetric(
	state = defaultIsColorMetricLinkedToHeightMetric,
	action: IsColorMetricLinkedToHeightMetricAction
) {
	switch (action.type) {
		case IsColorMetricLinkedToHeightMetricActions.TOGGLE_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC:
			return !state
		case IsColorMetricLinkedToHeightMetricActions.SET_IS_COLOR_METRIC_LINKED_TO_HEIGHT_METRIC:
			return action.payload
		default:
			return state
	}
}
