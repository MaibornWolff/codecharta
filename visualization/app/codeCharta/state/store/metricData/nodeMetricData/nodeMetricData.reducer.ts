import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { BlacklistItem, BlacklistType, NodeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { CodeMapHelper } from "../../../../util/codeMapHelper"
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
	const hashMap: Map<string, number> = new Map()

	for (const { file } of getVisibleFileStates(fileStates)) {
		for (const node of hierarchy(file.map)) {
			if (!node.children && node.data.path && !CodeMapHelper.isPathBlacklisted(node.data.path, blacklist, BlacklistType.exclude)) {
				for (const metric of Object.keys(node.data.attributes)) {
					const maxValue = hashMap.get(metric)

					if (maxValue === undefined || maxValue <= node.data.attributes[metric]) {
						hashMap.set(metric, node.data.attributes[metric])
					}
				}
			}
		}
	}

	const metricData: NodeMetricData[] = []

	// TODO: Remove the unary metric.
	hashMap.set(NodeMetricDataService.UNARY_METRIC, 1)

	for (const [key, value] of hashMap) {
		metricData.push({
			name: key,
			maxValue: value
		})
	}
	sortByMetricName(metricData)
	return metricData
}
