import { NodeMetricDataAction, NodeMetricDataActions, setNodeMetricData } from "./nodeMetricData.actions"
import { BlacklistItem, BlacklistType, CodeMapNode, NodeMetricData } from "../../../../codeCharta.model"
import { getVisibleFileStates } from "../../../../model/files/files.helper"
import { FileState } from "../../../../model/files/files"
import { CodeMapHelper } from "../../../../util/codeMapHelper"
import { hierarchy, HierarchyNode } from "d3"
import { NodeMetricDataService } from "./nodeMetricData.service"

const clone = require("rfdc")()

interface MaxMetricValuePair {
	maxValue: number
}

export function nodeMetricData(state: NodeMetricData[] = setNodeMetricData().payload, action: NodeMetricDataAction): NodeMetricData[] {
	switch (action.type) {
		case NodeMetricDataActions.SET_NODE_METRIC_DATA:
			return clone(action.payload)
		case NodeMetricDataActions.CALCULATE_NEW_NODE_METRIC_DATA:
			return setNewMetricData(action.payload.fileStates, action.payload.blacklist)
		default:
			return state
	}
}

function setNewMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): NodeMetricData[] {
	const newMetricData = calculateMetrics(fileStates, blacklist)
	addUnaryMetric(newMetricData)
	return newMetricData
}

function calculateMetrics(fileStates: FileState[], blacklist: BlacklistItem[]): NodeMetricData[] {
	const hashMap = buildHashMapFromMetrics(fileStates, blacklist)
	return getMetricDataFromHashMap(hashMap)
}

function buildHashMapFromMetrics(fileStates: FileState[], blacklist: BlacklistItem[]) {
	const hashMap: Map<string, MaxMetricValuePair> = new Map()

	getVisibleFileStates(fileStates).forEach((fileState: FileState) => {
		const nodes: HierarchyNode<CodeMapNode>[] = hierarchy(fileState.file.map).leaves()
		nodes.forEach((node: HierarchyNode<CodeMapNode>) => {
			if (node.data.path && !CodeMapHelper.isPathBlacklisted(node.data.path, blacklist, BlacklistType.exclude)) {
				addMaxMetricValuesToHashMap(node, hashMap)
			}
		})
	})
	return hashMap
}

function addMaxMetricValuesToHashMap(node: HierarchyNode<CodeMapNode>, hashMap: Map<string, MaxMetricValuePair>) {
	const attributes: string[] = Object.keys(node.data.attributes)

	attributes.forEach((metric: string) => {
		if (!hashMap.has(metric) || hashMap.get(metric).maxValue <= node.data.attributes[metric]) {
			hashMap.set(metric, {
				maxValue: node.data.attributes[metric]
			})
		}
	})
}

function getMetricDataFromHashMap(hashMap: Map<string, MaxMetricValuePair>): NodeMetricData[] {
	const metricData: NodeMetricData[] = []

	hashMap.forEach((value: MaxMetricValuePair, key: string) => {
		metricData.push({
			name: key,
			maxValue: value.maxValue
		})
	})
	return sortByAttributeName(metricData)
}

function sortByAttributeName(metricData: NodeMetricData[]): NodeMetricData[] {
	return metricData.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
}

function addUnaryMetric(metricData: NodeMetricData[]) {
	if (!metricData.some(x => x.name === NodeMetricDataService.UNARY_METRIC)) {
		metricData.push({
			name: NodeMetricDataService.UNARY_METRIC,
			maxValue: 1
		})
	}
}
