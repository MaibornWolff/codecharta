import { setHeightMetric } from "./heightMetric.actions"

export function splitHeightMetricAction(payload: string) {
	return setHeightMetric(payload)
}
