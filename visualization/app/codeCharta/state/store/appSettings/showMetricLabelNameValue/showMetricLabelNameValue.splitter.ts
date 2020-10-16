import { ShowMetricLabelNameValueAction, setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"

export function splitShowMetricLabelNameValueAction(payload: boolean): ShowMetricLabelNameValueAction {
	return setShowMetricLabelNameValue(payload)
}
