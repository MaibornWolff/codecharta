import { hierarchy, HierarchyNode } from "d3-hierarchy"
import { clone } from "lodash"
import { CodeMapNode, EdgeMetricData } from "../../codeCharta.model"
import { fileStatesAvailable, isDeltaState } from "../../model/files/files.helper"
import { isLeaf } from "../../util/codeMapHelper"
import { NodeDecorator } from "../../util/nodeDecorator"
import { createSelector } from "../angular-redux/createSelector"
import { EdgeMetricCountMap, nodeEdgeMetricsMap } from "../store/metricData/edgeMetricData/edgeMetricData.reducer"
import { CcState } from "../store/store"
import { fileSelector } from "./file.selector"
import { unifiedMapSelector } from "./unifiedMap.selector"

const metricDataSelector = (state: CcState) => state.metricData
const fileSettingsSelector = (state: CcState) => state.fileSettings

const getMetricValuesForNode = (node: HierarchyNode<CodeMapNode>, metricNames: string[]) => {
	const nodeEdgeMetrics: EdgeMetricCountMap = new Map()

	for (const metricName of metricNames) {
		const edgeMetricCount = nodeEdgeMetricsMap.get(metricName)
		if (edgeMetricCount) {
			nodeEdgeMetrics.set(metricName, edgeMetricCount.get(node.data.path))
		}
	}

	return nodeEdgeMetrics
}

const getEdgeMetricsForLeaves = (map: CodeMapNode, edgeMetricData: EdgeMetricData[]) => {
	const names = edgeMetricData.map(x => x.name)
	if (names.length === 0) {
		return
	}
	for (const node of hierarchy(map)) {
		if (isLeaf(node)) {
			const edgeMetrics = getMetricValuesForNode(node, names)
			for (const [key, value] of edgeMetrics) {
				node.data.edgeAttributes[key] = value
			}
		}
	}
}

export const decoratedUnifiedMapSelector = createSelector(
	[metricDataSelector, fileSelector, fileSettingsSelector, unifiedMapSelector],
	(metricData, files, fileSettings, unifiedMap) => {
		if (unifiedMap?.fileMeta && fileStatesAvailable(files) && metricData.nodeMetricData) {
			const map = clone(unifiedMap.map)
			NodeDecorator.decorateMap(map, metricData, fileSettings.blacklist)
			getEdgeMetricsForLeaves(map, metricData.edgeMetricData)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, isDeltaState(files), fileSettings.attributeTypes)
		}

		return unifiedMap
	}
)
