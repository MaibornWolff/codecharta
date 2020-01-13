import { ColorMetricAction, setColorMetric } from "./colorMetric.actions"

export function splitColorMetricAction(payload: string): ColorMetricAction {
	return setColorMetric(payload)
}
