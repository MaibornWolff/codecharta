import { ShowMetricLabelNameValueAction, ShowMetricLabelNameValueActions, setShowMetricLabelNameValue } from "./showMetricLabelNameValue.actions"
import { clone } from "../../../util/clone"

export function showMetricLabelNameValue(state = setShowMetricLabelNameValue().payload, action: ShowMetricLabelNameValueAction) {
	switch (action.type) {
		case ShowMetricLabelNameValueActions.SET_SHOW_METRIC_LABEL_NAME_VALUE:
			return action.payload
		default:
			return state
	}
}
