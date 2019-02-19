"use strict"

import * as d3 from "d3"
import { HierarchyNode } from "d3-hierarchy"
import { CCFile, CodeMapNode } from "../../codeCharta.model"

/**
 * Decorates the data structure with artificial metrics
 */
export class DataDecoratorService {
	public preDecorateFile(file: CCFile) {
		this.decorateMapWithOriginAttribute(file)
		this.decorateMapWithPathAttribute(file)
		this.decorateMapWithVisibleAttribute(file)
		this.decorateMapWithUnaryMetric(file)
	}

	public postDecorateFiles(files: CCFile[], metrics: string[]) {
		this.decorateLeavesWithMissingMetrics(files, metrics)
		this.decorateParentNodesWithSumAttributesOfChildren(files, metrics)
	}

	public decorateMapWithCompactMiddlePackages(file: CCFile) {
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

	public decorateMapWithUnaryMetric(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			let descendants: HierarchyNode<CodeMapNode>[] = root.descendants()

			for (let j = 0; j < descendants.length; j++) {
				if (!descendants[j].data.attributes) {
					descendants[j].data.attributes = {}
				}
				Object.assign(descendants[j].data.attributes, { unary: 1 })
			}
		}
	}

	public decorateMapWithVisibleAttribute(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				node.data.visible = true
			})
		}
	}

	public decorateMapWithOriginAttribute(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				node.data.origin = file.fileMeta.fileName
			})
		}
	}

	public decorateMapWithPathAttribute(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				let path = root.path(node)
				let pathString = ""
				path.forEach(pnode => {
					pathString += "/" + pnode.data.name
				})
				node.data.path = pathString
			})
		}
	}

	public decorateLeavesWithMissingMetrics(files: CCFile[], metrics: string[]) {
		files.forEach(file => {
			if (file && file.map) {
				let root = d3.hierarchy<CodeMapNode>(file.map)
				root.leaves().forEach(node => {
					//make sure attributes exist
					this.createAttributesIfNecessary(node)

					//create Metrics
					for (let i = 0; i < metrics.length; i++) {
						let metric = metrics[i]
						if (!node.data.attributes.hasOwnProperty(metric)) {
							node.data.attributes[metric] = 0
						}
					}
				})
			}
		})
	}

	public decorateParentNodesWithSumAttributesOfChildren(files: CCFile[], metrics: string[]) {
		files.forEach(file => {
			if (file && file.map) {
				let root = d3.hierarchy<CodeMapNode>(file.map)
				root.each(node => {
					this.decorateNodeWithChildrenSumMetrics(node, metrics)
				})
			}
		})
	}

	public decorateNodeWithChildrenSumMetrics(node, metrics: string[]) {
		//make sure attributes exist
		this.createAttributesIfNecessary(node)

		//if attributes is empty define property for each possible metric as a sum function of child metrics
		for (let i = 0; i < metrics.length; i++) {
			let metric = metrics[i]
			if (!node.data.attributes.hasOwnProperty(metric) && node.data.children && node.data.children.length > 0) {
				this.defineAttributeAsSumMethod(node, metric)
			}
		}
	}

	private defineAttributeAsSumMethod(node, metric: string) {
		Object.defineProperty(node.data.attributes, metric, {
			enumerable: true,
			get: () => {
				let sum = 0
				let l = node.leaves()
				for (let count = 0; count < l.length; count++) {
					sum += l[count].data.attributes[metric]
				}
				return sum
			}
		})
	}

	private createAttributesIfNecessary(node) {
		if (!node.data.attributes) {
			node.data.attributes = {}
		}
	}
}
