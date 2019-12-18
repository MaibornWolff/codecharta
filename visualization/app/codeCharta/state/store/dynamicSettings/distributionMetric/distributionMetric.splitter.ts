import { DistributionMetricAction, setDistributionMetric } from "./distributionMetric.actions"

export function splitDistributionMetricAction(payload: string): DistributionMetricAction {
	return setDistributionMetric(payload)
}
