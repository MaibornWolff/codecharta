"use strict"

import * as d3 from "d3"
import {CCFile, CodeMapNode} from "../../codeCharta.model"

export class CodeMapNodeDecoratorService {

	public static SELECTOR = "codeMapNodeDecoratorService"

	public decorateFiles(files: CCFile[], metrics: string[]) {
		files.forEach(file => this.preDecorateFile(file))
		this.postDecorateFiles(files, metrics)
	}

	public preDecorateFile(file: CCFile) {
		this.decorateMapWithMissingObjects(file)
		this.decorateMapWithCompactMiddlePackages(file)
	}

	public postDecorateFiles(files: CCFile[], metrics: string[]) {
		this.decorateLeavesWithMissingMetrics(files, metrics)
		this.decorateParentNodesWithSumAttributesOfChildren(files, metrics)
	}

	private decorateMapWithCompactMiddlePackages(file: CCFile) {
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


	private decorateMapWithMissingObjects(file: CCFile) {
		if (file && file.map) {
			let root = d3.hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				node.data.visible = true
				node.data.origin = file.fileMeta.fileName
				node.data.path = "/" + root.path(node).map(x => x.data.name).join("/")
				node.data.attributes = (!node.data.attributes) ? {} : node.data.attributes
				Object.assign(node.data.attributes, { unary: 1 })
			})
		}
	}

	private decorateLeavesWithMissingMetrics(files: CCFile[], metrics: string[]) {
		files.forEach(file => {
			if (file.map && metrics) {
				let root = d3.hierarchy<CodeMapNode>(file.map)
				root.leaves().forEach(node => {
					metrics.forEach(metric => {
						if (!node.data.attributes.hasOwnProperty(metric)) {
							node.data.attributes[metric] = 0
						}
					})
				})
			}
		})
	}

	private decorateParentNodesWithSumAttributesOfChildren(files: CCFile[], metrics: string[]) {
		files.forEach(file => {
			if (file.map) {
				let root = d3.hierarchy<CodeMapNode>(file.map)
				root.each(node => {
					this.decorateNodeWithChildrenSumMetrics(node, metrics)
				})
			}
		})
	}

	private decorateNodeWithChildrenSumMetrics(node, metrics: string[]) {
		metrics.forEach(metric => {
			if (!node.data.attributes.hasOwnProperty(metric) && node.data.children && node.data.children.length > 0) {
				this.defineAttributeAsSumMethod(node, metric)
			}
		})
	}

	private defineAttributeAsSumMethod(node, metric: string) {
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
