import { ShowMetricLabelNodeNameAction, ShowMetricLabelNodeNameActions, setShowMetricLabelNodeName } from "./showMetricLabelNodeName.actions"

export function showMetricLabelNodeName(state = setShowMetricLabelNodeName().payload, action: ShowMetricLabelNodeNameAction) {
	switch (action.type) {
		case ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME:
			return action.payload
		default:
			return state
	}
}
