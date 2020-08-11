import { EdgeMetricDataAction, EdgeMetricDataActions, setEdgeMetricData } from "./edgeMetricData.actions"
import { BlacklistItem, BlacklistType, Edge, EdgeMetricCount, EdgeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { CodeMapHelper } from "../../../../util/codeMapHelper"
import { FileState } from "../../../../model/files/files"
import { EdgeMetricDataService } from "./edgeMetricData.service"

const clone = require("rfdc")()

export type EdgeMetricCountMap = Map<string, EdgeMetricCount>
export type NodeEdgeMetricsMap = Map<string, EdgeMetricCountMap>
// Required for performance improvements
export let nodeEdgeMetricsMap: NodeEdgeMetricsMap = new Map()

export function edgeMetricData(state: EdgeMetricData[] = setEdgeMetricData().payload, action: EdgeMetricDataAction): EdgeMetricData[] {
	switch (action.type) {
		case EdgeMetricDataActions.SET_EDGE_METRIC_DATA:
			return clone(action.payload)
		case EdgeMetricDataActions.CALCULATE_NEW_EDGE_METRIC_DATA:
			return clone(calculateMetrics(action.payload.fileStates, action.payload.blacklist))
		default:
			return state
	}
}

function calculateMetrics(fileStates: FileState[], blacklist: BlacklistItem[]): EdgeMetricData[] {
	const hashMap = calculateEdgeMetricData(fileStates, blacklist)
	const newEdgeMetricData = getMetricDataFromMap(hashMap)
	addNoneMetric(newEdgeMetricData)
	sortNodeEdgeMetricsMap()
	return newEdgeMetricData
}

function calculateEdgeMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): NodeEdgeMetricsMap {
	nodeEdgeMetricsMap = new Map()
	const allFilePaths = []
	for (const fileState of getVisibleFileStates(fileStates)) {
		allFilePaths.push(...CodeMapHelper.getAllPaths(fileState.file.map))
		fileState.file.settings.fileSettings.edges.forEach(edge => {
			if (bothNodesAssociatedAreVisible(edge, allFilePaths, blacklist)) {
				addEdgeToCalculationMap(edge)
			}
		})
	}

	return nodeEdgeMetricsMap
}

function bothNodesAssociatedAreVisible(edge: Edge, filePaths: string[], blacklist: BlacklistItem[]): boolean {
	const fromPath = filePaths.find(x => x === edge.fromNodeName)
	const toPath = filePaths.find(x => x === edge.toNodeName)
	return fromPath && toPath && isNotBlacklisted(fromPath, blacklist) && isNotBlacklisted(toPath, blacklist)
}

function isNotBlacklisted(path: string, blacklist: BlacklistItem[]): boolean {
	return !CodeMapHelper.isPathBlacklisted(path, blacklist, BlacklistType.exclude)
}

function addEdgeToCalculationMap(edge: Edge) {
	for (const edgeMetric of Object.keys(edge.attributes)) {
		const edgeMetricEntry = getEntryForMetric(edgeMetric)
		addEdgeToNodes(edgeMetricEntry, edge.fromNodeName, edge.toNodeName)
	}
}

function getEntryForMetric(edgeMetricName: string): EdgeMetricCountMap {
	let nodeEdgeMetric = nodeEdgeMetricsMap.get(edgeMetricName)
	if (!nodeEdgeMetric) {
		nodeEdgeMetric = new Map()
		nodeEdgeMetricsMap.set(edgeMetricName, nodeEdgeMetric)
	}
	return nodeEdgeMetric
}

function addEdgeToNodes(edgeMetricEntry: EdgeMetricCountMap, fromNode: string, toNode: string) {
	createEntryIfNecessary(edgeMetricEntry, fromNode)
	createEntryIfNecessary(edgeMetricEntry, toNode)
	edgeMetricEntry.get(fromNode).outgoing += 1
	edgeMetricEntry.get(toNode).incoming += 1
}

function createEntryIfNecessary(edgeMetricEntry: EdgeMetricCountMap, nodeName: string) {
	if (!edgeMetricEntry.has(nodeName)) {
		edgeMetricEntry.set(nodeName, { incoming: 0, outgoing: 0 })
	}
}

function getMetricDataFromMap(hashMap: NodeEdgeMetricsMap): EdgeMetricData[] {
	const metricData: EdgeMetricData[] = []

	hashMap.forEach((occurences: EdgeMetricCountMap, edgeMetric: string) => {
		let maximumMetricValue = 0
		occurences.forEach((value: EdgeMetricCount) => {
			const combinedValue = value.incoming + value.outgoing
			if (combinedValue > maximumMetricValue) {
				maximumMetricValue = combinedValue
			}
		})
		metricData.push({ name: edgeMetric, maxValue: maximumMetricValue })
	})

	return metricData
}

function sortNodeEdgeMetricsMap() {
	const sortedEdgeMetricMap = new Map()
	if (nodeEdgeMetricsMap) {
		nodeEdgeMetricsMap.forEach((value, key) => {
			const sortedMapForMetric = new Map(
				[...value.entries()].sort((a, b) => b[1].incoming + b[1].outgoing - (a[1].incoming + a[1].outgoing))
			)
			sortedEdgeMetricMap.set(key, sortedMapForMetric)
		})
	}
	nodeEdgeMetricsMap = sortedEdgeMetricMap
}

function addNoneMetric(metricData: EdgeMetricData[]) {
	if (!metricData.some(x => x.name === EdgeMetricDataService.NONE_METRIC)) {
		metricData.push({ name: EdgeMetricDataService.NONE_METRIC, maxValue: 0 })
	}
}
