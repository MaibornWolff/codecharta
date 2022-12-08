"use strict"
import { hierarchy } from "d3-hierarchy"
import { AttributeTypes, AttributeTypeValue, BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData } from "../codeCharta.model"
import { isLeaf, isNodeExcludedOrFlattened } from "./codeMapHelper"
import { UNARY_METRIC } from "../state/selectors/accumulatedData/metricData/nodeMetricData.selector"

const enum MedianSelectors {
	MEDIAN = "MEDIAN",
	DELTA = "DELTA",
	INCOMING = "INCOMING",
	OUTGOING = "OUTGOING"
}

const enum EdgeAttributeType {
	INCOMING = "incoming",
	OUTGOING = "outgoing"
}

export const NodeDecorator = {
	decorateMap(map: CodeMapNode, metricData: MetricData, blacklist: BlacklistItem[]) {
		for (const item of blacklist) {
			for (const { data } of hierarchy(map)) {
				if (blacklist.length > 0) {
					if (item.type === BlacklistType.flatten) {
						data.isFlattened = data.isFlattened ? true : isNodeExcludedOrFlattened(data, item.path)
					} else {
						data.isExcluded = data.isExcluded ? true : isNodeExcludedOrFlattened(data, item.path) && isLeaf(data)
					}
				}
			}
		}
		map.isExcluded = false
		this.decorateMapWithMetricData(map, metricData)
	},

	decorateMapWithMetricData(map: CodeMapNode, metricData: MetricData) {
		const { nodeMetricData, edgeMetricData } = metricData
		let id = 0
		for (const { data } of hierarchy(map)) {
			data.id = id
			id++

			if (data.attributes === undefined) {
				data.attributes = {}
			}

			if (isLeaf(data)) {
				data.attributes[UNARY_METRIC] = 1
			}

			for (const metric of nodeMetricData) {
				if (data.attributes[metric.key] === undefined) {
					data.attributes[metric.key] = 0
				}

				if (data.deltas !== undefined && data.deltas[metric.key] === undefined) {
					data.deltas[metric.key] = 0
				}
			}

			if (data.edgeAttributes === undefined) {
				data.edgeAttributes = {}
			}

			for (const metric of edgeMetricData) {
				if (data.edgeAttributes[metric.key] === undefined) {
					data.edgeAttributes[metric.key] = { incoming: 0, outgoing: 0 }
				}
			}

			mergeFolderChain(data)
		}
	},

	decorateMapWithPathAttribute(file: CCFile) {
		for (const node of hierarchy(file.map)) {
			node.data.path = node.parent ? `${node.parent.data.path}/${node.data.name}` : `/${node.data.name}`
		}
		return file
	},

	decorateParentNodesWithAggregatedAttributes(map: CodeMapNode, isDeltaState: boolean, attributeTypes: AttributeTypes) {
		const medians: Map<string, number[]> = new Map()
		// TODO: Combine decorateMap, decorateMapWithPathAttribute and this one and
		// remove the Object.keys calls from then on. They are identical to the
		// `nodeMetricData` and `edgeMetricData` names.
		const attributeKeys = Object.keys(map.attributes)

		const edgeKeys = Object.keys(map.edgeAttributes)
		hierarchy(map).eachAfter(function decorateNode({ data, parent }) {
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
					if (isDeltaState && parent.data.deltas) {
						parent.data.deltas[name] = parent.data.deltas[name] ?? 0
						parent.data.deltas[name] += data.deltas[name] ?? 0
					}
				}
			}

			if (isDeltaState && parent.data.fileCount) {
				parent.data.fileCount.added += data.fileCount.added
				parent.data.fileCount.changed += data.fileCount.changed
				parent.data.fileCount.removed += data.fileCount.removed
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
				if (isDeltaState && map.deltas) {
					map.deltas[name] = getMedian(medians.get(`${MedianSelectors.DELTA}${name}${map.path}`))
				}
			}
		}
	}
}

function mergeFolderChain(data: CodeMapNode) {
	// Nodes with only one child which also have children are merged into one node
	// e.g. a /folder which includes anotherFolder that includes other files or folders
	// will be merged to a node with path /folder/anotherFolder and children are set accordingly
	if (data.children?.length === 1 && data.children[0]?.fixedPosition) {
		return
	}

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
		collectMedians(medians, `${MedianSelectors.MEDIAN}${parentSelector}`, child, child.attributes[metricName])
	}

	if (isDeltaState && child.deltas && child.deltas[metricName] !== 0) {
		collectMedians(medians, `${MedianSelectors.DELTA}${parentSelector}`, child, child.deltas[metricName])
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
	if (isLeaf(child)) {
		return
	}

	const numbers = medians.get(`${MedianSelectors.MEDIAN}${selector}`)
	if (numbers !== undefined) {
		child.attributes[metricName] = getMedian(numbers)
		setMediansToParents(medians, `${MedianSelectors.MEDIAN}${parentSelector}`, numbers)
	}

	if (isDeltaState && child.deltas) {
		const deltaNumbers = medians.get(`${MedianSelectors.DELTA}${selector}`)
		if (deltaNumbers !== undefined) {
			child.deltas[metricName] = getMedian(deltaNumbers)
			setMediansToParents(medians, `${MedianSelectors.DELTA}${parentSelector}`, deltaNumbers)
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
	if (isLeaf(child)) {
		return
	}

	const numbers = medians.get(selector)
	if (numbers !== undefined) {
		child.edgeAttributes[metricName][type] = getMedian(numbers)
		setMediansToParents(medians, parentSelector, numbers)
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
	// TODO: Check if this should be set if it's not a leaf.
	const median = medians.get(selector)
	if (median === undefined) {
		medians.set(selector, [value])
	} else if (isLeaf(child)) {
		pushSorted(median, value)
	}
}

// TODO: Evaluate if sorting in `getMedian` is not better than using a
// pre-sorted array. It's a lot less code and should roughly have the same
// performance.
export function getMedian(numbers: number[]) {
	if (numbers === undefined || numbers.length === 0) {
		return 0
	}

	const middle = (numbers.length - 1) / 2
	return (numbers[Math.floor(middle)] + numbers[Math.ceil(middle)]) / 2
}

export function pushSorted(numbers: number[], number: number) {
	let min = 0
	let max = numbers.length - 1
	let guess = 0

	if (max < 0 || numbers[max] <= number) {
		numbers.push(number)
		return
	}
	if (numbers[0] >= number) {
		numbers.unshift(number)
		return
	}

	// Use a binary search to find the correct entry.
	while (min <= max) {
		guess = Math.floor((min + max) / 2)

		if (numbers[guess] < number) {
			min = guess + 1
		} else {
			max = guess - 1
			if (numbers[max] <= number) {
				numbers.splice(guess, 0, number)
				return
			}
		}
	}
}

function pushSortedArray(numbers: number[], toPush: number[]) {
	let totalPushes = 0
	for (let index = 0; index < numbers.length; index++) {
		let pushCount = 0

		while (numbers[index] > toPush[totalPushes]) {
			pushCount++
			totalPushes++
			if (totalPushes === toPush.length) {
				break
			}
		}

		if (pushCount > 0) {
			numbers.splice(index, 0, ...toPush.slice(totalPushes - pushCount, totalPushes))
			if (totalPushes === toPush.length) {
				return
			}
		}
	}
	numbers.push(...toPush.slice(totalPushes))
}
