import { ShowLabelMetricNameValueAction, setShowLabelMetricNameValue } from "./showLabelMetricNameValue.actions"

export function splitShowLabelMetricNameValueAction(payload: boolean): ShowLabelMetricNameValueAction {
	return setShowLabelMetricNameValue(payload)
}
