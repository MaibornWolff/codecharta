"use strict"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import { BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData, FileMeta, EdgeMetricCount, KeyValuePair } from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import _ from "lodash"

export class NodeDecorator {
	public static decorateMap(map: CodeMapNode, fileMeta: FileMeta, metricData: MetricData[]) {
		this.decorateMapWithMissingObjects(map, fileMeta)
		this.decorateMapWithCompactMiddlePackages(map)
		this.decorateLeavesWithMissingMetrics(map, metricData)
	}

	public static preDecorateFile(file: CCFile) {
		this.decorateMapWithPathAttribute(file)
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
		edgeMetricData: MetricData[],
		isDeltaState: boolean
	) {
		if (map) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.each((node: HierarchyNode<CodeMapNode>) => {
				const leaves: HierarchyNode<CodeMapNode>[] = node
					.leaves()
					.filter(x => !CodeMapHelper.isBlacklisted(x.data, blacklist, BlacklistType.exclude))
				this.decorateNodeWithChildrenSumMetrics(leaves, node, metricData, isDeltaState)
				this.decorateNodeWithChildrenSumEdgeMetrics(leaves, node, edgeMetricData)
			})
		}
		return map
	}

	private static decorateNodeWithChildrenSumMetrics(
		leaves: HierarchyNode<CodeMapNode>[],
		node: HierarchyNode<CodeMapNode>,
		metricData: MetricData[],
		isDeltaState: boolean
	) {
		metricData.forEach(metric => {
			if (node.data.children && node.data.children.length > 0) {
				node.data.attributes[metric.name] = this.getMetricSumOfLeaves(leaves.map(x => x.data.attributes), metric.name)
				if (isDeltaState) {
					node.data.deltas[metric.name] = this.getMetricSumOfLeaves(leaves.map(x => x.data.deltas), metric.name)
				}
			}
		})
	}

	private static decorateNodeWithChildrenSumEdgeMetrics(
		leaves: HierarchyNode<CodeMapNode>[],
		node: HierarchyNode<CodeMapNode>,
		edgeMetricData: MetricData[]
	) {
		edgeMetricData.forEach(edgeMetric => {
			if (node.data.children && node.data.children.length > 0) {
				node.data.edgeAttributes[edgeMetric.name] = this.getEdgeMetricSumOfLeaves(leaves, edgeMetric.name)
			}
		})
	}

	private static getMetricSumOfLeaves(metrics: KeyValuePair[], metricName: string): number {
		const metricValues: number[] = metrics.map(x => x[metricName]).filter(x => !!x)

		if (metricValues.length > 0) {
			return metricValues.reduce((partialSum, a) => partialSum + a)
		}
		return 0
	}

	private static getEdgeMetricSumOfLeaves(leaves: HierarchyNode<CodeMapNode>[], metricName: string): EdgeMetricCount {
		const metricValues: EdgeMetricCount[] = leaves.map(x => x.data.edgeAttributes[metricName]).filter(x => !!x)

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
