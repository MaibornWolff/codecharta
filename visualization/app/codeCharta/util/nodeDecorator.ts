"use strict"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import { BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData, FileMeta, EdgeMetricCount } from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import _ from "lodash"

export class NodeDecorator {
	public static decorateMap(map: CodeMapNode, fileMeta: FileMeta, metricData: MetricData[]): CodeMapNode {
		let decoratedMap: CodeMapNode = _.cloneDeep(map)
		this.decorateMapWithMissingObjects(decoratedMap, fileMeta)
		this.decorateMapWithCompactMiddlePackages(decoratedMap)
		this.decorateLeavesWithMissingMetrics(decoratedMap, metricData)
		return decoratedMap
	}

	public static preDecorateFile(file: CCFile): CCFile {
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
				current.edgeAttributes = child.edgeAttributes
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
				node.data.attributes = !node.data.attributes ? {} : node.data.attributes
				node.data.edgeAttributes = !node.data.edgeAttributes ? {} : node.data.edgeAttributes
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

	public static decorateParentNodesWithSumAttributes(
		map: CodeMapNode,
		blacklist: BlacklistItem[],
		metricData: MetricData[],
		edgeMetricData: MetricData[]
	) {
		if (map) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.each((node: HierarchyNode<CodeMapNode>) => {
				this.decorateNodeWithChildrenSumMetrics(node, blacklist, metricData, edgeMetricData)
			})
		}
		return map
	}

	private static decorateNodeWithChildrenSumMetrics(
		node: HierarchyNode<CodeMapNode>,
		blacklist: BlacklistItem[],
		metricData: MetricData[],
		edgeMetricData: MetricData[]
	) {
		const leaves = node.leaves().filter(x => !CodeMapHelper.isBlacklisted(x.data, blacklist, BlacklistType.exclude))

		metricData.forEach(metric => {
			if (node.data.children && node.data.children.length > 0) {
				node.data.attributes[metric.name] = this.getMetricSumOfLeaves(leaves, metric.name)
			}
		})
		edgeMetricData.forEach(edgeMetric => {
			if (node.data.children && node.data.children.length > 0) {
				node.data.edgeAttributes[edgeMetric.name] = this.getEdgeMetricSumOfLeaves(leaves, edgeMetric.name)
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

	private static getEdgeMetricSumOfLeaves(leaves: HierarchyNode<CodeMapNode>[], metric: string): EdgeMetricCount {
		const metricValues = leaves.map(x => x.data.edgeAttributes[metric]).filter(x => !!x)

		if (metricValues.length > 0) {
			const sum = { incoming: 0, outgoing: 0 }
			metricValues.forEach(element => {
				sum.incoming += element.incoming
				sum.outgoing += element.outgoing
			})
			return sum
		}

		return { incoming: 0, outgoing: 0 }
	}
}
