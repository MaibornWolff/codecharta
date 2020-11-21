import { ShowMetricLabelNodeNameAction, setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

export function splitShowMetricLabelNodeNameAction(payload: boolean): ShowMetricLabelNodeNameAction {
	return setShowMetricLabelNodeName(payload)
}
