import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { BlacklistItem, BlacklistType, NodeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { isLeaf, isPathBlacklisted } from "../../../../util/codeMapHelper"
import { hierarchy } from "d3-hierarchy"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { sortByMetricName } from "../metricData.reducer"

export function nodeMetricData(state = setNodeMetricData().payload, action: NodeMetricDataAction) {
	switch (action.type) {
		case NodeMetricDataActions.SET_NODE_METRIC_DATA:
			return action.payload
		case NodeMetricDataActions.CALCULATE_NEW_NODE_METRIC_DATA:
			return setNewMetricData(action.payload.fileStates, action.payload.blacklist)
		default:
			return state
	}
}

function setNewMetricData(fileStates: FileState[], blacklist: BlacklistItem[]) {
	const metricMaxValues: Map<string, number> = new Map()
	const metricMinValues: Map<string, number> = new Map()

	for (const { file } of getVisibleFileStates(fileStates)) {
		for (const node of hierarchy(file.map)) {
			if (isLeaf(node) && node.data.path && !isPathBlacklisted(node.data.path, blacklist, BlacklistType.exclude)) {
				for (const metric of Object.keys(node.data.attributes)) {
					const maxValue = metricMaxValues.get(metric)
					const minValue = metricMinValues.get(metric)

					if (minValue === undefined || minValue >= node.data.attributes[metric]) {
						metricMinValues.set(metric, node.data.attributes[metric])
					}

					if (maxValue === undefined || maxValue <= node.data.attributes[metric]) {
						metricMaxValues.set(metric, node.data.attributes[metric])
					}
				}
			}
		}
	}

	const metricData: NodeMetricData[] = []

	// TODO: Remove the unary metric.
	metricMaxValues.set(NodeMetricDataService.UNARY_METRIC, 1)
	metricMinValues.set(NodeMetricDataService.UNARY_METRIC, 1)

	for (const [key, value] of metricMaxValues) {
		metricData.push({
			name: key,
			maxValue: value,
			minValue: metricMinValues.get(key)
		})
	}

	sortByMetricName(metricData)
	return metricData
}
