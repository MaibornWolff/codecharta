"use strict"
import { hierarchy } from "d3"
import { AttributeTypes, AttributeTypeValue, BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData } from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import ignore from "ignore"
import { NodeMetricDataService } from "../state/store/metricData/nodeMetricData/nodeMetricData.service"

enum MedianSelectors {
	MEDIAN = "MEDIAN",
	DELTA = "DELTA",
	INCOMING = "INCOMING",
	OUTGOING = "OUTGOING"
}

enum EdgeAttributeType {
	INCOMING = "incoming",
	OUTGOING = "outgoing"
}

enum NodeAttributeType {
	ATTRIBUTES = "attributes",
	DELTAS = "deltas"
}

export class NodeDecorator {
	static decorateMap(map: CodeMapNode, metricData: MetricData, blacklist: BlacklistItem[]) {
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

		const { nodeMetricData, edgeMetricData } = metricData
		let id = 0
		for (const { data } of hierarchy(map).descendants()) {
			data.id = id
			id++

			if (data.attributes === undefined) {
				data.attributes = {}
			}

			for (const metric of nodeMetricData) {
				if (data.attributes[metric.name] === undefined) {
					data.attributes[metric.name] = 0
				}

				if (data.deltas !== undefined) {
					if (data.deltas[metric.name] === undefined) {
						data.deltas[metric.name] = 0
					}
				}
			}

			if (isLeaf(data)) {
				data.attributes[NodeMetricDataService.UNARY_METRIC] = 1
			}

			if (data.edgeAttributes === undefined) {
				data.edgeAttributes = {}
			}

			for (const metric of edgeMetricData) {
				if (data.edgeAttributes[metric.name] === undefined) {
					data.edgeAttributes[metric.name] = { incoming: 0, outgoing: 0 }
				}
			}

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

	static decorateMapWithPathAttribute(file: CCFile) {
		hierarchy(file.map).each(node => {
			if (node.parent) {
				node.data.path = `${node.parent.data.path}/${node.data.name}`
			} else {
				node.data.path = `/${node.data.name}`
			}
		})
		return file
	}

	static decorateParentNodesWithAggregatedAttributes(map: CodeMapNode, isDeltaState: boolean, attributeTypes: AttributeTypes) {
		const medians: Map<string, number[]> = new Map()
		// TODO: Combine decorateMap, decorateMapWithPathAttribute and this one and
		// remove the Object.keys calls from then on. They are identical to the
		// `nodeMetricData` and `edgeMetricData` names. 
		const attributeKeys = Object.keys(map.attributes)
		const edgeKeys = Object.keys(map.edgeAttributes)
		hierarchy(map).eachAfter(({ data, parent }) => {
			// skip root
			if (data.isExcluded || !parent) {
				return
			}

			for (const name of attributeKeys) {
				const selector = `${name}${data.path}`
				const parentSelector = `${name}${parent.data.path}`
				if (attributeTypes.nodes[name] === AttributeTypeValue.relative) {
					setNodeMediansToParent(medians, selector, parentSelector, data, name, isDeltaState)
					collectNodeMediansOnParent(medians, parentSelector, data, name, isDeltaState)
				} else {
					parent.data.attributes[name] += data.attributes[name]
					if (isDeltaState) {
						parent.data.deltas[name] = parent.data.deltas[name] ?? 0
						parent.data.deltas[name] += data.deltas[name] ?? 0
					}
				}
			}

			for (const name of edgeKeys) {
				const value = data.edgeAttributes[name]

				if (!value) {
					continue
				}

				const selector = `${name}${data.path}`
				const parentSelector = `${name}${parent.data.path}`
				if (attributeTypes.edges[name] === AttributeTypeValue.relative) {
					setEdgeMediansToParent(
						medians,
						`${MedianSelectors.INCOMING}${selector}`,
						`${MedianSelectors.INCOMING}${parentSelector}`,
						data,
						name,
						EdgeAttributeType.INCOMING
					)
					setEdgeMediansToParent(
						medians,
						`${MedianSelectors.OUTGOING}${selector}`,
						`${MedianSelectors.OUTGOING}${parentSelector}`,
						data,
						name,
						EdgeAttributeType.OUTGOING
					)
					collectEdgeMediansOnParent(
						medians,
						`${MedianSelectors.INCOMING}${parentSelector}`,
						data,
						name,
						EdgeAttributeType.INCOMING
					)
					collectEdgeMediansOnParent(
						medians,
						`${MedianSelectors.OUTGOING}${parentSelector}`,
						data,
						name,
						EdgeAttributeType.OUTGOING
					)
				} else {
					parent.data.edgeAttributes[name].incoming += value.incoming
					parent.data.edgeAttributes[name].outgoing += value.outgoing
				}
			}
		})

		// Set Median for root node
		for (const name of edgeKeys) {
			if (attributeTypes.edges[name] === AttributeTypeValue.relative) {
				map.edgeAttributes[name].incoming = getMedian(medians.get(`${MedianSelectors.INCOMING}${name}${map.path}`))
				map.edgeAttributes[name].outgoing = getMedian(medians.get(`${MedianSelectors.OUTGOING}${name}${map.path}`))
			}
		}

		for (const name of attributeKeys) {
			if (attributeTypes.nodes[name] === AttributeTypeValue.relative) {
				map.attributes[name] = getMedian(medians.get(`${MedianSelectors.MEDIAN}${name}${map.path}`))
				if (isDeltaState) {
					map.deltas[name] = getMedian(medians.get(`${MedianSelectors.DELTA}${name}${map.path}`))
				}
			}
		}
	}
}

function collectEdgeMediansOnParent(
	medians: Map<string, number[]>,
	selector: string,
	child: CodeMapNode,
	metricName: string,
	type: EdgeAttributeType
) {
	if (child.edgeAttributes[metricName][type] !== 0) {
		collectMedians(medians, selector, child, child.edgeAttributes[metricName][type])
	}
}

function collectNodeMediansOnParent(
	medians: Map<string, number[]>,
	parentSelector: string,
	child: CodeMapNode,
	metricName: string,
	isDeltaState: boolean
) {
	if (child.attributes[metricName] !== 0) {
		collectMedians(medians, `${MedianSelectors.MEDIAN}${parentSelector}`, child, child[NodeAttributeType.ATTRIBUTES][metricName])
	}

	if (isDeltaState && child.deltas[metricName] !== 0) {
		collectMedians(medians, `${MedianSelectors.DELTA}${parentSelector}`, child, child[NodeAttributeType.DELTAS][metricName])
	}
}

function setNodeMediansToParent(
	medians: Map<string, number[]>,
	selector: string,
	parentSelector: string,
	child: CodeMapNode,
	metricName: string,
	isDeltaState: boolean
) {
	if (!isLeaf(child)) {
		const numbers = medians.get(`${MedianSelectors.MEDIAN}${selector}`)
		if (numbers !== undefined) {
			child.attributes[metricName] = getMedian(numbers)
			setMediansToParents(medians, `${MedianSelectors.MEDIAN}${parentSelector}`, numbers)
		}

		if (isDeltaState) {
			const deltaNumbers = medians.get(`${MedianSelectors.DELTA}${selector}`)
			if (deltaNumbers !== undefined) {
				child.deltas[metricName] = getMedian(deltaNumbers)
				setMediansToParents(medians, `${MedianSelectors.DELTA}${parentSelector}`, deltaNumbers)
			}
		}
	}
}

function setEdgeMediansToParent(
	medians: Map<string, number[]>,
	selector: string,
	parentSelector: string,
	child: CodeMapNode,
	metricName: string,
	type: EdgeAttributeType
) {
	if (!isLeaf(child)) {
		const numbers = medians.get(selector)
		if (numbers !== undefined) {
			child.edgeAttributes[metricName][type] = getMedian(numbers)
			setMediansToParents(medians, parentSelector, numbers)
		}
	}
}

function setMediansToParents(medians: Map<string, number[]>, parentSelector: string, numbers: number[]) {
	const median = medians.get(parentSelector)
	if (median === undefined) {
		medians.set(parentSelector, numbers)
	} else {
		pushSortedArray(median, numbers)
	}
}

function collectMedians(medians: Map<string, number[]>, selector: string, child: CodeMapNode, value: number) {
	const median = medians.get(selector)
	if (median === undefined) {
		medians.set(selector, [value])
	} else if (isLeaf(child)) {
		pushSorted(median, value)
	}
}

function isLeaf(node: CodeMapNode) {
	return !node.children || node.children.length === 0
}

function getMedian(numbers: number[]) {
	if (numbers === undefined || numbers.length === 0) {
		return 0
	}

	const middle = (numbers.length - 1) / 2
	return (numbers[Math.floor(middle)] + numbers[Math.ceil(middle)]) / 2
}

function pushSorted(numbers: number[], number: number) {
	for (let i = 0; i < numbers.length; i++) {
		if (numbers[i] > number) {
			numbers.splice(i, 0, number)
			return
		}
	}
	numbers.push(number)
}

function pushSortedArray(numbers: number[], toPush: number[]) {
	let j = 0
	for (let i = 0; i < numbers.length; i++) {
		let pushCount = 0

		while (numbers[i] > toPush[j]) {
			pushCount++
			j++
			if (j === toPush.length) {
				break
			}
		}

		if (pushCount > 0) {
			numbers.splice(i, 0, ...toPush.slice(j - pushCount, j))
			if (j === toPush.length) {
				return
			}
		}
	}
	numbers.push(...toPush.slice(j))
}
