import {
	defaultIsColorMetricLinkedToHeightMetric,
	IsColorMetricLinkedToHeightMetricAction,
	IsColorMetricLinkedToHeightMetricActions
} from "./isColorMetricLinkedToHeightMetricActions"

export function isColorMetricLinkedToHeightMetric(
	state = defaultIsColorMetricLinkedToHeightMetric,
	action: IsColorMetricLinkedToHeightMetricAction
) {
	if (action.type === IsColorMetricLinkedToHeightMetricActions.TOGGLE_LINK_BETWEEN_COLOR_METRIC_AND_HEIGHT_METRIC) {
		return !state
	}
	return state
}
