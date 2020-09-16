import { setDistributionMetric } from "./distributionMetric.actions"

export function splitDistributionMetricAction(payload: string) {
	return setDistributionMetric(payload)
}
