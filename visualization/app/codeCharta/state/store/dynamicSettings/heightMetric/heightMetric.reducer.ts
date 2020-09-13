import { HeightMetricAction, HeightMetricActions, setHeightMetric } from "./heightMetric.actions"

export function heightMetric(state: string = setHeightMetric().payload, action: HeightMetricAction) {
	switch (action.type) {
		case HeightMetricActions.SET_HEIGHT_METRIC:
			return action.payload
		default:
			return state
	}
}
