import { hierarchy } from "d3-hierarchy"
import { BlacklistItem, Edge, EdgeMetricCount, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { isPathBlacklisted } from "../../../../util/codeMapHelper"
import { sortByMetricName } from "./sortByMetricName"

export type EdgeMetricCountMap = Map<string, EdgeMetricCount>
export type NodeEdgeMetricsMap = Map<string, EdgeMetricCountMap>

export function calculateEdgeMetricData(visibleFileStates: FileState[], blacklist: BlacklistItem[]) {
	const nodeEdgeMetricsMap: NodeEdgeMetricsMap = new Map()

	const allFilePaths: Set<string> = new Set()

	for (const { file } of visibleFileStates) {
		for (const { data } of hierarchy(file.map)) {
			allFilePaths.add(data.path)
		}
	}

	for (const fileState of visibleFileStates) {
		for (const edge of fileState.file.settings.fileSettings.edges) {
			if (bothNodesAssociatedAreVisible(edge, allFilePaths, blacklist)) {
				// TODO: We likely only need the attributes once per file.
				for (const edgeMetric of Object.keys(edge.attributes)) {
					const edgeMetricEntry = updateEntryForMetric(nodeEdgeMetricsMap, edgeMetric)
					addEdgeToNodes(edgeMetricEntry, edge.fromNodeName, edge.toNodeName)
				}
			}
		}
	}
	const newEdgeMetricData = getMetricDataFromMap(nodeEdgeMetricsMap)
	sortByMetricName(newEdgeMetricData)
	return {
		edgeMetricData: newEdgeMetricData,
		nodeEdgeMetricsMap
	}
}

function bothNodesAssociatedAreVisible(edge: Edge, filePaths: Set<string>, blacklist: BlacklistItem[]) {
	if (filePaths.has(edge.fromNodeName) && filePaths.has(edge.toNodeName)) {
		return !isPathBlacklisted(edge.fromNodeName, blacklist, "exclude") && !isPathBlacklisted(edge.toNodeName, blacklist, "exclude")
	}
	return false
}

function updateEntryForMetric(nodeEdgeMetricsMap: NodeEdgeMetricsMap, edgeMetricName: string) {
	let nodeEdgeMetric = nodeEdgeMetricsMap.get(edgeMetricName)
	if (!nodeEdgeMetric) {
		nodeEdgeMetric = new Map()
		nodeEdgeMetricsMap.set(edgeMetricName, nodeEdgeMetric)
	}
	return nodeEdgeMetric
}

function addEdgeToNodes(edgeMetricEntry: EdgeMetricCountMap, fromNode: string, toNode: string) {
	const fromNodeEdgeMetric = edgeMetricEntry.get(fromNode)
	if (fromNodeEdgeMetric === undefined) {
		edgeMetricEntry.set(fromNode, { incoming: 0, outgoing: 1 })
	} else {
		fromNodeEdgeMetric.outgoing += 1
	}

	const toNodeEdgeMetric = edgeMetricEntry.get(toNode)
	if (toNodeEdgeMetric === undefined) {
		edgeMetricEntry.set(toNode, { incoming: 1, outgoing: 0 })
	} else {
		toNodeEdgeMetric.incoming += 1
	}
}

function getMetricDataFromMap(nodeEdgeMetricsMap: NodeEdgeMetricsMap) {
	const metricData: EdgeMetricData[] = []

	for (const [edgeMetric, occurrences] of nodeEdgeMetricsMap) {
		let maximumMetricValue = 0
		let minimumMetricValue = Number.MIN_SAFE_INTEGER
		for (const value of occurrences.values()) {
			const combinedValue = value.incoming + value.outgoing
			if (combinedValue > maximumMetricValue) {
				maximumMetricValue = combinedValue
			}
			if (combinedValue <= minimumMetricValue) {
				minimumMetricValue = combinedValue
			}
		}
		metricData.push({
			name: edgeMetric,
			maxValue: maximumMetricValue,
			minValue: minimumMetricValue
		})
	}

	return metricData
}
