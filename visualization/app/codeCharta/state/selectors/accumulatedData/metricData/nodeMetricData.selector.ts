import { hierarchy } from "d3-hierarchy"

import { BlacklistItem, BlacklistType, NodeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { isLeaf, isPathBlacklisted } from "../../../../util/codeMapHelper"
import { createSelector } from "../../../angular-redux/store"
import { blacklistSelector } from "../../../store/fileSettings/blacklist/blacklist.selector"
import { visibleFileStatesSelector } from "../../visibleFileStates.selector"
import { sortByMetricName } from "./sortByMetricName"

export const UNARY_METRIC = "unary"

export const calculateNodeMetricData = (visibleFileStates: FileState[], blacklist: BlacklistItem[]) => {
	if (visibleFileStates.length === 0) {
		return []
	}

	const metricMaxValues: Map<string, number> = new Map()
	const metricMinValues: Map<string, number> = new Map()

	for (const { file } of visibleFileStates) {
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
	metricMaxValues.set(UNARY_METRIC, 1)
	metricMinValues.set(UNARY_METRIC, 1)

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

export const nodeMetricDataSelector = createSelector([visibleFileStatesSelector, blacklistSelector], calculateNodeMetricData)
