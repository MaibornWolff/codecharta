import { HeightMetricAction, HeightMetricActions } from "./heightMetric.actions"

export function heightMetric(state: string = null, action: HeightMetricAction): string {
	switch (action.type) {
		case HeightMetricActions.SET_HEIGHT_METRIC:
			return action.payload
		default:
			return state
	}
}
