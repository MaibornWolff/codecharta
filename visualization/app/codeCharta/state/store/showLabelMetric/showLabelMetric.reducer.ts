import { ShowLabelMetricAction, ShowLabelMetricActions, setShowLabelMetric } from "./showLabelMetric.actions"
import { clone } from "../../../util/clone"

export function showLabelMetric(state = setShowLabelMetric().payload, action: ShowLabelMetricAction) {
	switch (action.type) {
		case ShowLabelMetricActions.SET_SHOW_LABEL_METRIC:
			return action.payload
		default:
			return state
	}
}
