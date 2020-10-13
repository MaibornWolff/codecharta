import { ShowLabelMetricAction, setShowLabelMetric } from "./showLabelMetric.actions"

export function splitShowLabelMetricAction(payload: boolean): ShowLabelMetricAction {
	return setShowLabelMetric(payload)
}
