import { AreaMetricAction, AreaMetricActions } from "./areaMetric.actions"

export function areaMetric(state: string = null, action: AreaMetricAction): string {
	switch (action.type) {
		case AreaMetricActions.SET_AREA_METRIC:
			return action.payload
		default:
			return state
	}
}
