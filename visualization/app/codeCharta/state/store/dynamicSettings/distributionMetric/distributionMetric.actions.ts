import { CCAction } from "../../../../codeCharta.model"

export enum DistributionMetricActions {
	SET_DISTRIBUTION_METRIC = "SET_DISTRIBUTION_METRIC"
}

export interface SetDistributionMetricAction extends CCAction {
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
