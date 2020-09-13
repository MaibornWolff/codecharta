import { ColorMetricAction, ColorMetricActions, setColorMetric } from "./colorMetric.actions"

export function colorMetric(state: string = setColorMetric().payload, action: ColorMetricAction) {
	switch (action.type) {
		case ColorMetricActions.SET_COLOR_METRIC:
			return action.payload
		default:
			return state
	}
}
