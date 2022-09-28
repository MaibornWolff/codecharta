import {
	defaultIsHeightAndColorMetricCoupled,
	IsHeightAndColorMetricCoupledAction,
	IsHeightAndColorMetricCoupledActions
} from "./isHeightAndColorMetricCoupled.actions"

export function isHeightAndColorMetricCoupled(state = defaultIsHeightAndColorMetricCoupled, action: IsHeightAndColorMetricCoupledAction) {
	switch (action.type) {
		case IsHeightAndColorMetricCoupledActions.TOGGLE_IS_HEIGHT_AND_COLOR_METRIC_COUPLED:
			return !state
		default:
			return state
	}
}
