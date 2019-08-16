"use strict"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import { BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData, FileMeta } from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import _ from "lodash"
import { EdgeMetricService } from "../state/edgeMetric.service"

export class NodeDecorator {
	public static decorateMap(
		map: CodeMapNode,
		fileMeta: FileMeta,
		blacklist: BlacklistItem[],
		metricData: MetricData[],
		edgeMetricService: EdgeMetricService
	): CodeMapNode {
		let decoratedMap: CodeMapNode = _.cloneDeep(map)
		this.decorateMapWithMissingObjects(decoratedMap, fileMeta)
		this.decorateMapWithCompactMiddlePackages(decoratedMap)
		this.decorateLeavesWithMissingMetrics(decoratedMap, metricData)
		this.decorateLeavesWithEdgeMetrics(decoratedMap, edgeMetricService, metricData)
		this.decorateParentNodesWithSumAttributesOfChildren(decoratedMap, blacklist, metricData)
		return decoratedMap
	}

	public static preDecorateFile(file: CCFile): CCFile {
		// TODO: predecorate origin as well? so in multiple mode the files keep its original origin attribute
		let decoratedFile: CCFile = _.cloneDeep(file)
		this.decorateMapWithPathAttribute(decoratedFile)
		return decoratedFile
	}

	private static decorateMapWithCompactMiddlePackages(map: CodeMapNode) {
		const isEmptyMiddlePackage = current => {
			return (
				current &&
				current.children &&
				current.children.length === 1 &&
				current.children[0].children &&
				current.children[0].children.length > 0
			)
		}

		const rec = current => {
			if (isEmptyMiddlePackage(current)) {
				let child = current.children[0]
				current.children = child.children
				current.name += "/" + child.name
				current.path += "/" + child.name
				if (child.link) {
					current.link = child.link
				}
				current.attributes = child.attributes
				current.deltas = child.deltas
				rec(current)
			} else if (current && current.children && current.children.length > 1) {
				for (let i = 0; i < current.children.length; i++) {
					rec(current.children[i])
				}
			}
		}

		if (map) {
			rec(map)
		}
	}

	private static decorateMapWithPathAttribute(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				node.data.path =
					"/" +
					root
						.path(node)
						.map(x => x.data.name)
						.join("/")
			})
		}
		return file
	}

	private static decorateMapWithMissingObjects(map: CodeMapNode, fileMeta: FileMeta) {
		if (map) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.each(node => {
				node.data.visible = true
				node.data.origin = fileMeta.fileName
				node.data.attributes = !node.data.attributes ? {} : node.data.attributes
				Object.assign(node.data.attributes, { unary: 1 })
			})
		}
	}

	private static decorateLeavesWithMissingMetrics(map: CodeMapNode, metricData: MetricData[]) {
		if (map && metricData) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.leaves().forEach(node => {
				metricData.forEach(metric => {
					if (!node.data.attributes.hasOwnProperty(metric.name)) {
						node.data.attributes[metric.name] = 0
					}
				})
			})
		}
	}

	private static decorateLeavesWithEdgeMetrics(map: CodeMapNode, edgeMetricService: EdgeMetricService, metricData: MetricData[]) {
		if (map && edgeMetricService.getMetricNames()) {
			edgeMetricService.getMetricData().forEach(metric => {
				metricData.push(metric)
			})
			let root = d3.hierarchy<CodeMapNode>(map)
			root.leaves().forEach(node => {
				const edgeMetrics = edgeMetricService.getMetricValuesForNode(node)
				for (let edgeMetric of edgeMetrics.keys()) {
					// TODO: assign to edgeAttributes or something to avoid name clashing
					Object.assign(node.data.attributes, { [edgeMetric]: edgeMetrics.get(edgeMetric) })
				}
			})
		}
	}

	private static decorateParentNodesWithSumAttributesOfChildren(map: CodeMapNode, blacklist: BlacklistItem[], metricData: MetricData[]) {
		if (map) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.each((node: HierarchyNode<CodeMapNode>) => {
				this.decorateNodeWithChildrenSumMetrics(node, blacklist, metricData)
			})
		}
	}

	private static decorateNodeWithChildrenSumMetrics(
		node: HierarchyNode<CodeMapNode>,
		blacklist: BlacklistItem[],
		metricData: MetricData[]
	) {
		const leaves = node.leaves().filter(x => !CodeMapHelper.isBlacklisted(x.data, blacklist, BlacklistType.exclude))

		metricData.forEach(metric => {
			if (node.data.children && node.data.children.length > 0) {
				node.data.attributes[metric.name] = this.getMetricSumOfLeaves(leaves, metric.name)
			}
		})
	}

	private static getMetricSumOfLeaves(leaves: HierarchyNode<CodeMapNode>[], metric: string): number {
		const metricValues = leaves.map(x => x.data.attributes[metric]).filter(x => !!x)

		if (metricValues.length > 0) {
			return metricValues.reduce((partialSum, a) => partialSum + a)
		}

		return 0
	}
}
