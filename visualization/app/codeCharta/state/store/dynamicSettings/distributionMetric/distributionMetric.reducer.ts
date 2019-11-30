import { DistributionMetricAction, DistributionMetricActions } from "./distributionMetric.actions"

export function distributionMetric(state: string = null, action: DistributionMetricAction): string {
	switch (action.type) {
		case DistributionMetricActions.SET_DISTRIBUTION_METRIC:
			return action.payload
		default:
			return state
	}
}
