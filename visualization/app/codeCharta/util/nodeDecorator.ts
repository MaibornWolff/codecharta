"use strict"
import * as d3 from "d3"
import {HierarchyNode} from "d3"
import {BlacklistType, CCFile, CodeMapNode, MetricData, Settings} from "../codeCharta.model"
import {CodeMapHelper} from "./codeMapHelper";
import _ from "lodash"

export class NodeDecorator {
	public static decorateFile(file: CCFile, settings: Settings, metricData: MetricData[]): CCFile {
		const before = Date.now()
		let decoratedFile: CCFile = _.cloneDeep(file)
		this.decorateMapWithMissingObjects(decoratedFile)
		this.decorateMapWithCompactMiddlePackages(decoratedFile)
		this.decorateLeavesWithMissingMetrics(decoratedFile, metricData)
		this.decorateParentNodesWithSumAttributesOfChildren(decoratedFile, settings, metricData)
		console.log("decorateFile took " + (Date.now() - before) + "ms")
		return decoratedFile
	}

	public static preDecorateFile(file: CCFile): CCFile {
		// TODO: predecorate origin as well? so in multiple mode the files keep its original origin attribute
		let decoratedFile: CCFile = _.cloneDeep(file)
		this.decorateMapWithPathAttribute(decoratedFile)
		return decoratedFile
	}

	private static decorateMapWithCompactMiddlePackages(file: CCFile) {
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

		if (file && file.map) {
			rec(file.map)
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

	private static decorateMapWithMissingObjects(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				node.data.visible = true
				node.data.origin = file.fileMeta.fileName
				node.data.attributes = !node.data.attributes ? {} : node.data.attributes
				Object.assign(node.data.attributes, { unary: 1 })
			})
		}
	}

	private static decorateLeavesWithMissingMetrics(file: CCFile, metricData: MetricData[]) {
		if (file && file.map && metricData) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.leaves().forEach(node => {
				metricData.forEach(metric => {
					if (!node.data.attributes.hasOwnProperty(metric.name)) {
						node.data.attributes[metric.name] = 0
					}
				})
			})
		}
	}

	private static decorateParentNodesWithSumAttributesOfChildren(file: CCFile, settings: Settings, metricData: MetricData[]) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each((node: HierarchyNode<CodeMapNode>) => {
				this.decorateNodeWithChildrenSumMetrics(node, settings, metricData)
			})
		}
	}

	private static decorateNodeWithChildrenSumMetrics(node: HierarchyNode<CodeMapNode>, settings: Settings, metricData: MetricData[]) {
		const leaves = node.leaves().filter(x => !CodeMapHelper.isBlacklisted(x.data, settings.fileSettings.blacklist, BlacklistType.exclude))

		metricData.forEach(metric => {
			if (!node.data.attributes.hasOwnProperty(metric.name) && node.data.children && node.data.children.length > 0) {
				node.data.attributes[metric.name] = this.getMetricSumOfLeaves(leaves, metric.name)
			}
		})
	}

	private static getMetricSumOfLeaves(leaves: HierarchyNode<CodeMapNode>[], metric: string): number {
		return leaves.map(x => x.data.attributes[metric])
			.reduce((partialSum, a) => partialSum + a)
	}
}
