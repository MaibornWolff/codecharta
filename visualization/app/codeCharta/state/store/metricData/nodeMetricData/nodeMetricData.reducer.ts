import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { BlacklistItem, BlacklistType, NodeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { CodeMapHelper } from "../../../../util/codeMapHelper"
import { hierarchy } from "d3"
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
		for (const { data } of hierarchy(file.map).leaves()) {
			if (data.path && !CodeMapHelper.isPathBlacklisted(data.path, blacklist, BlacklistType.exclude)) {
				// TODO: The attributes should be identical on each node
				for (const metric of Object.keys(data.attributes)) {
					const maxValue = hashMap.get(metric)

					if (maxValue === undefined || maxValue <= data.attributes[metric]) {
						hashMap.set(metric, data.attributes[metric])
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
