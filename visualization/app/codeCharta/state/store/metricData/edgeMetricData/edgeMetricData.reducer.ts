import { EdgeMetricDataAction, EdgeMetricDataActions, setEdgeMetricData } from "./edgeMetricData.actions"
import { BlacklistItem, BlacklistType, Edge, EdgeMetricCount, EdgeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { CodeMapHelper } from "../../../../util/codeMapHelper"
import { FileState } from "../../../../model/files/files"
import { EdgeMetricDataService } from "./edgeMetricData.service"

const clone = require("rfdc")()

// Required for performance improvements
export type NodeEdgeMetricsMap = Map<string, Map<string, EdgeMetricCount>>
export let nodeEdgeMetricsMap: NodeEdgeMetricsMap

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

function calculateEdgeMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): Map<string, Map<string, EdgeMetricCount>> {
	nodeEdgeMetricsMap = new Map()
	const pathsPerFileState = getVisibleFileStates(fileStates).map(fileState => CodeMapHelper.getAllPaths(fileState.file.map))
	const allFilePaths: string[] = [].concat(...pathsPerFileState)
	getVisibleFileStates(fileStates).forEach(fileState => {
		fileState.file.settings.fileSettings.edges.forEach(edge => {
			if (bothNodesAssociatedAreVisible(edge, allFilePaths, blacklist)) {
				addEdgeToCalculationMap(edge)
			}
		})
	})
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

function getEntryForMetric(edgeMetricName: string): Map<string, EdgeMetricCount> {
	if (!nodeEdgeMetricsMap.has(edgeMetricName)) {
		nodeEdgeMetricsMap.set(edgeMetricName, new Map())
	}
	return nodeEdgeMetricsMap.get(edgeMetricName)
}

function addEdgeToNodes(edgeMetricEntry: Map<string, EdgeMetricCount>, fromNode: string, toNode: string) {
	createEntryIfNecessary(edgeMetricEntry, fromNode)
	createEntryIfNecessary(edgeMetricEntry, toNode)
	edgeMetricEntry.get(fromNode).outgoing += 1
	edgeMetricEntry.get(toNode).incoming += 1
}

function createEntryIfNecessary(edgeMetricEntry: Map<string, EdgeMetricCount>, nodeName: string) {
	if (!edgeMetricEntry.has(nodeName)) {
		edgeMetricEntry.set(nodeName, { incoming: 0, outgoing: 0 })
	}
}

function getMetricDataFromMap(hashMap: Map<string, Map<string, EdgeMetricCount>>): EdgeMetricData[] {
	const metricData: EdgeMetricData[] = []

	hashMap.forEach((occurences: any, edgeMetric: any) => {
		let maximumMetricValue = 0
		occurences.forEach((value: EdgeMetricCount, _) => {
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
