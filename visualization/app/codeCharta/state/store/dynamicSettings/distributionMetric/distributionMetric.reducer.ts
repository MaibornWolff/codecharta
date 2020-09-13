import { DistributionMetricAction, DistributionMetricActions, setDistributionMetric } from "./distributionMetric.actions"

export function distributionMetric(state: string = setDistributionMetric().payload, action: DistributionMetricAction) {
	switch (action.type) {
		case DistributionMetricActions.SET_DISTRIBUTION_METRIC:
			return action.payload
		default:
			return state
	}
}
