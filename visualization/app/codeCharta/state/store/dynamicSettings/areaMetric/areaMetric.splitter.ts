import { AreaMetricAction, setAreaMetric } from "./areaMetric.actions"

export function splitAreaMetricAction(payload: string): AreaMetricAction {
	return setAreaMetric(payload)
}
