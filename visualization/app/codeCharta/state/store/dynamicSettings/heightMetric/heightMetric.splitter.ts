import { HeightMetricAction, setHeightMetric } from "./heightMetric.actions"

export function splitHeightMetricAction(payload: string): HeightMetricAction {
	return setHeightMetric(payload)
}
