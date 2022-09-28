import {
	defaultIsHeightAndColorMetricLinked,
	IsHeightAndColorMetricLinkedAction,
	IsHeightAndColorMetricLinkedActions
} from "./isHeightAndColorMetricLinked.actions"

export function isHeightAndColorMetricLinked(state = defaultIsHeightAndColorMetricLinked, action: IsHeightAndColorMetricLinkedAction) {
	switch (action.type) {
		case IsHeightAndColorMetricLinkedActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_LINKED:
			return !state
		default:
			return state
	}
}
