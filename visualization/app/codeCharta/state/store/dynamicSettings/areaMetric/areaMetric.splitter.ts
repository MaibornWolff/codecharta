import { setAreaMetric } from "./areaMetric.actions"

export function splitAreaMetricAction(payload: string) {
	return setAreaMetric(payload)
}
