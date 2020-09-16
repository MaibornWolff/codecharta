import { setColorMetric } from "./colorMetric.actions"

export function splitColorMetricAction(payload: string) {
	return setColorMetric(payload)
}
