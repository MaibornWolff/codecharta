import {
	defaultIsHeightAndColorMetricLinked,
	IsHeightAndColorMetricLinkedAction,
	IsHeightAndColorMetricLinkedActions
} from "./isHeightAndColorMetricLinked.actions"

export function isHeightAndColorMetricLinked(state = defaultIsHeightAndColorMetricLinked, action: IsHeightAndColorMetricLinkedAction) {
	if (action.type === IsHeightAndColorMetricLinkedActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED) {
		return !state
	}
	return state
}
