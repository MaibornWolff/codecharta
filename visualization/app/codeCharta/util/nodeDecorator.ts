"use strict"
import * as d3 from "d3"
import {CCFile, CodeMapNode, MetricData} from "../codeCharta.model"

export class NodeDecorator {

	public static decorateFile(file: CCFile, metricData: MetricData[]): CCFile {
		let decoratedFile: CCFile = this.deepCopy(file)
		this.decorateMapWithMissingObjects(decoratedFile)
		this.decorateMapWithCompactMiddlePackages(decoratedFile)
		this.decorateLeavesWithMissingMetrics(decoratedFile, metricData)
		this.decorateParentNodesWithSumAttributesOfChildren(decoratedFile, metricData)
		return decoratedFile
	}

	private static deepCopy(file: CCFile): CCFile {
		return JSON.parse(JSON.stringify(file))
	}

	public static preDecorateFile(file: CCFile): CCFile {
		// TODO: predecorate origin as well? so in multiple mode the files keep its original origin attribute
		return this.decorateMapWithPathAttribute(file)
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
				node.data.path = "/" + root.path(node).map(x => x.data.name).join("/")
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
				node.data.attributes = (!node.data.attributes) ? {} : node.data.attributes
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

	private static decorateParentNodesWithSumAttributesOfChildren(file: CCFile, metricData: MetricData[]) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				this.decorateNodeWithChildrenSumMetrics(node, metricData)
			})
		}
	}

	private static decorateNodeWithChildrenSumMetrics(node, metricData: MetricData[]) {
		metricData.forEach(metric => {
			if (!node.data.attributes.hasOwnProperty(metric.name) && node.data.children && node.data.children.length > 0) {
				this.defineAttributeAsSumMethod(node, metric.name)
			}
		})
	}

	private static defineAttributeAsSumMethod(node, metric: string) {
		Object.defineProperty(node.data.attributes, metric, {
			enumerable: true,
			get: () => {
				return node.leaves()
					.map(x => x.data.attributes[metric])
					.reduce((partialSum, a) => partialSum + a)
			}
		})
	}
}
