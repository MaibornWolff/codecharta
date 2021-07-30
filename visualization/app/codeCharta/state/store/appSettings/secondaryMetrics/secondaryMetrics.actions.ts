import { Action } from "redux"
import { SecondaryMetric } from "../../../../ui/attributeSideBar/attributeSideBar.component"

export enum SecondaryMetricsActions {
	SET_SECONDARY_METRICS = "SET_SECONDARY_METRICS"
}

export interface SetSecondaryMetricsAction extends Action {
	type: SecondaryMetricsActions.SET_SECONDARY_METRICS
	payload: SecondaryMetric[]
}

export type SecondaryMetricsAction = SetSecondaryMetricsAction

export function setSecondaryMetrics(secondaryMetrics: SecondaryMetric[] = defaultSecondaryMetrics): SetSecondaryMetricsAction {
	return {
		type: SecondaryMetricsActions.SET_SECONDARY_METRICS,
		payload: secondaryMetrics
	}
}

export const defaultSecondaryMetrics: SecondaryMetric[] = []
