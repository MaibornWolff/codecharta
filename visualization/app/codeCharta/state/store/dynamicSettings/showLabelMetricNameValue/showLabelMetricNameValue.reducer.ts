import { ShowLabelMetricNameValueAction, ShowLabelMetricNameValueActions, setShowLabelMetricNameValue } from "./showLabelMetricNameValue.actions"
import { clone } from "../../../util/clone"

export function showLabelMetricNameValue(state = setShowLabelMetricNameValue().payload, action: ShowLabelMetricNameValueAction) {
	switch (action.type) {
		case ShowLabelMetricNameValueActions.SET_SHOW_LABEL_METRIC_NAME_VALUE:
			return action.payload
		default:
			return state
	}
}
