import { CCAction, RecursivePartial, MetricData } from "../../../codeCharta.model"

// Plop: Append default property import here
import { defaultEdgeMetricData } from "./edgeMetricData/edgeMetricData.actions"
import { defaultNodeMetricData } from "./nodeMetricData/nodeMetricData.actions"

export enum MetricDataActions {
	SET_METRIC_DATA = "SET_METRIC_DATA"
}

export interface SetMetricDataAction extends CCAction {
	type: MetricDataActions.SET_METRIC_DATA
	payload: RecursivePartial<MetricData>
}

export type MetricDataAction = SetMetricDataAction

export function setMetricData(metricData: RecursivePartial<MetricData> = defaultMetricData): MetricDataAction {
	return {
		type: MetricDataActions.SET_METRIC_DATA,
		payload: metricData
	}
}

export const defaultMetricData: MetricData = {
	// Plop: Append default property here
	edgeMetricData: defaultEdgeMetricData,
	nodeMetricData: defaultNodeMetricData
}
