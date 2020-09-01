import { RecursivePartial, CCAction, MetricData, EdgeMetricData } from "../../../codeCharta.model"

// Plop: Append action splitter import here
import { splitEdgeMetricDataAction } from "./edgeMetricData/edgeMetricData.splitter"
import { splitNodeMetricDataAction } from "./nodeMetricData/nodeMetricData.splitter"

export function splitMetricDataActions(payload: RecursivePartial<MetricData>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.edgeMetricData !== undefined) {
		actions.push(splitEdgeMetricDataAction(payload.edgeMetricData as EdgeMetricData[]))
	}

	if (payload.nodeMetricData !== undefined) {
		actions.push(splitNodeMetricDataAction(payload.nodeMetricData as EdgeMetricData[]))
	}

	return actions
}
