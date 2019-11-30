import { ColorMetricAction, ColorMetricActions } from "./colorMetric.actions"

export function colorMetric(state: string = null, action: ColorMetricAction): string {
	switch (action.type) {
		case ColorMetricActions.SET_COLOR_METRIC:
			return action.payload
		default:
			return state
	}
}
