import { setEdgeMetric } from "./edgeMetric.actions"

export function splitEdgeMetricAction(payload: string) {
	return setEdgeMetric(payload)
}
