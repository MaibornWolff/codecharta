import {
	IsColorMetricLinkedToHeightMetricAction,
	setIsColorMetricLinkedToHeightMetricAction
} from "./isColorMetricLinkedToHeightMetric.actions"

export function splitIsColorMetricLinkedToHeightMetricAction(payload: boolean): IsColorMetricLinkedToHeightMetricAction {
	return setIsColorMetricLinkedToHeightMetricAction(payload)
}
