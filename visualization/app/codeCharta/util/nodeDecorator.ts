"use strict"
import { HierarchyNode, hierarchy } from "d3"
import {
	BlacklistItem,
	CCFile,
	CodeMapNode,
	KeyValuePair,
	AttributeTypes,
	AttributeTypeValue,
	BlacklistType,
	NodeMetricData,
	EdgeMetricData
} from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import ignore from "ignore"
import { NodeMetricDataService } from "../state/store/metricData/nodeMetricData/nodeMetricData.service"

function hasChildren(node) {
	return node.children?.length > 0
}

export class NodeDecorator {
	public static decorateMap(map: CodeMapNode, metricData: NodeMetricData[], blacklist: BlacklistItem[]) {
		const root = hierarchy<CodeMapNode>(map)

		const flattened = ignore()
		const excluded = ignore()

		let hasFlattenedPaths = false
		let hasExcludedPaths = false

		for (const item of blacklist) {
			const path = CodeMapHelper.transformPath(item.path)

			if (item.type === BlacklistType.flatten) {
				hasFlattenedPaths = true
				flattened.add(path)
			} else {
				hasExcludedPaths = true
				excluded.add(path)
			}
		}

		let id = 0

		const defaultAttributes = { [NodeMetricDataService.UNARY_METRIC]: 1 }
		const defaultLeafAttributes = { ...defaultAttributes }
		if (metricData?.length) {
			for (const { name } of metricData) {
				defaultLeafAttributes[name] = 0
			}
		}

		for (const { data } of root.descendants()) {
			data.id = id
			id++
			if (data.attributes) {
				data.attributes[NodeMetricDataService.UNARY_METRIC] = 1
				if (metricData?.length && !hasChildren(data)) {
					for (const metric of metricData) {
						if (data.attributes[metric.name] === undefined) {
							data.attributes[metric.name] = 0
						}
					}
				}
			} else if (hasChildren(data)) {
				data.attributes = defaultAttributes
			} else {
				data.attributes = defaultLeafAttributes
			}
			data.edgeAttributes = data.edgeAttributes ?? {}

			if (blacklist.length !== 0) {
				const path = CodeMapHelper.transformPath(data.path)
				data.isFlattened = hasFlattenedPaths && flattened.ignores(path)
				data.isExcluded = hasExcludedPaths && excluded.ignores(path)
			}

			// TODO: Verify the need for this code. It is unclear why child
			// properties are copied to their parent.
			if (data.children?.length === 1 && data.children[0].children?.length > 0) {
				const [child] = data.children
				data.children = child.children
				data.name += `/${child.name}`
				data.path += `/${child.name}`
				if (child.link) {
					data.link = child.link
				}
			}
		}
	}

	public static decorateMapWithPathAttribute(file: CCFile) {
		if (file?.map) {
			const root = hierarchy<CodeMapNode>(file.map)
			root.each(node => {
				// TODO: This could be simplified. It is possible to get the current
				// path without using `root.path()`.
				const nodePath = root.path(node)
				let path = "/"
				const last = nodePath.pop()
				for (const { data } of nodePath) {
					path += `${data.name}/`
				}
				path += last.data.name
				node.data.path = path
			})
		}
		return file
	}

	public static decorateParentNodesWithAggregatedAttributes(
		map: CodeMapNode,
		metricData: NodeMetricData[],
		edgeMetricData: EdgeMetricData[],
		isDeltaState: boolean,
		attributeTypes: AttributeTypes
	) {
		const root = hierarchy<CodeMapNode>(map)
		root.each((node: HierarchyNode<CodeMapNode>) => {
			let edgeMetrics;
			const { data } = node

			if (!hasChildren(data)) {
				return
			}

			for (const { name } of edgeMetricData) {
				data.edgeAttributes[name] = { incoming: 0, outgoing: 0 }
			}
			const leafAttributes = []
			const leafDeltas = []
			// TODO: This provides a huge potential for optimization. The algorithm
			// should be linear instead of O(n * m) [root.each() * node.leaves()] by
			// using a depth first algorithm. Each current node tracks all
			// `attributes`, `deltas` and `edgeAttributes` of the outer nodes
			// combined. That way there's no need to traverse any node more than once.
			//
			// It is also possible to aggregate the stats linear. It's straight
			// forward for non-median stats (the common case): these are just counted
			// together. A map should be used to track the different depth.
			// Calculating the median is more complex, both memory and computational
			// wise. Instead of calculating the stats together of all outer nodes, an
			// array of these should be collected (only if required!). New entries are
			// then added to the array where they fit using array.splice. That way
			// finding the median is linear instead of O(n log n). It is likely
			// possible to optimize the latter further but that is probably too much
			// work.
			for (const { data } of node.leaves()) {
				if (data.isExcluded) {
					continue;
				}
				leafAttributes.push(data.attributes)
				if (data.deltas !== undefined) {
					leafDeltas.push(data.deltas)
				}
				if (!data.edgeAttributes) {
					continue;
				}
				// Optimize for the common case
				for (const [name, value] of Object.entries(data.edgeAttributes)) {
					if (!value) {
						continue;
					}
					if (attributeTypes.edges[name] === AttributeTypeValue.relative) {
						// Use the median after collecting all entries.
						if (edgeMetrics === undefined) {
							edgeMetrics = {}
						}
						if (edgeMetrics[name] === undefined) {
							edgeMetrics[name] = { incoming: [value.incoming], outgoing: [value.outgoing] }
						} else {
							edgeMetrics[name].incoming.push(value.incoming)
							edgeMetrics[name].outgoing.push(value.outgoing)
						}
					} else {
						// Set directly
						node.data.edgeAttributes[name].incoming += value.incoming
						node.data.edgeAttributes[name].outgoing += value.outgoing
					}
				}
			}

			for (const { name } of metricData) {
				data.attributes[name] = this.aggregateLeafMetric(
					leafAttributes,
					name,
					attributeTypes
				)
				if (isDeltaState) {
					data.deltas[name] = this.aggregateLeafMetric(
						leafDeltas,
						name,
						attributeTypes
					)
				}
			}

			if (edgeMetrics) {
				for (const [name, value] of Object.entries(edgeMetrics)) {
					const temp = value as Record<string, number[]>
					data.edgeAttributes[name].incoming = this.median(temp.incoming)
					data.edgeAttributes[name].outgoing = this.median(temp.outgoing)
				}
			}
		})
		return map
	}

	private static aggregateLeafMetric(metrics: KeyValuePair[], metricName: string, attributeTypes: AttributeTypes): number {
		if (attributeTypes.nodes[metricName] === AttributeTypeValue.relative) {
			const metricValues: number[] = []
			for (const metric of metrics) {
				const number = metric[metricName]
				if (number) {
					metricValues.push(number)
				}
			}
	
			if (metricValues.length === 0) {
				return 0
			}
			return this.median(metricValues)
		}

		return metrics.reduce((partialSum, a) => partialSum + (a[metricName] ?? 0), 0)
	}

	private static median(numbers: number[]): number {
		const middle = (numbers.length - 1) / 2
		numbers.sort((a, b) => a - b)
		return (numbers[Math.floor(middle)] + numbers[Math.ceil(middle)]) / 2
	}
}
