import { EdgeMetricAction, setEdgeMetric } from "./edgeMetric.actions"

export function splitEdgeMetricAction(payload: string): EdgeMetricAction {
	return setEdgeMetric(payload)
}
