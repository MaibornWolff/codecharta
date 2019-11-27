import { Action } from "redux"

export enum DistributionMetricActions {
	SET_DISTRIBUTION_METRIC = "SET_DISTRIBUTION_METRIC"
}

export interface SetDistributionMetricAction extends Action {
	type: DistributionMetricActions.SET_DISTRIBUTION_METRIC
	payload: string
}

export type DistributionMetricAction = SetDistributionMetricAction

export function setDistributionMetric(distributionMetric: string): DistributionMetricAction {
	return {
		type: DistributionMetricActions.SET_DISTRIBUTION_METRIC,
		payload: distributionMetric
	}
}
