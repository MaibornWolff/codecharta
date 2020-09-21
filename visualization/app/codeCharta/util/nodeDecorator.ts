"use strict"
import { hierarchy } from "d3"
import { AttributeTypes, AttributeTypeValue, BlacklistItem, BlacklistType, CCFile, CodeMapNode, MetricData } from "../codeCharta.model"
import { CodeMapHelper } from "./codeMapHelper"
import ignore from "ignore"

enum MedianSelectors {
	MEDIAN = "MEDIAN",
	DELTA = "DELTA",
	INCOMING = "INCOMING",
	OUTGOING = "OUTGOING"
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

		const defaultEdgeAttributes = {}
		for (const { name } of edgeMetricData) {
			defaultEdgeAttributes[name] = { incoming: 0, outgoing: 0 }
		}

		const defaultNodeAttributes = {}
		for (const { name } of nodeMetricData) {
			defaultNodeAttributes[name] = 0
		}

		let id = 0
		hierarchy(map).each(({ data }) => {
			data.id = id
			id++

			if (data.attributes) {
				for (const metric of nodeMetricData) {
					if (data.attributes[metric.name] === undefined) {
						data.attributes[metric.name] = 0
					}
				}
			} else {
				data.attributes = { ...defaultNodeAttributes }
			}

			if (data.edgeAttributes) {
				for (const metric of edgeMetricData) {
					if (data.edgeAttributes[metric.name] === undefined) {
						data.edgeAttributes[metric.name] = { incoming: 0, outgoing: 0 }
					}
				}
			} else {
				data.edgeAttributes = { ...defaultEdgeAttributes }
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
		})
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
					if (!isLeaf(data)) {
						// Set Median to parents
						const numbers = medians.get(`${MedianSelectors.MEDIAN}${selector}`)
						if (numbers !== undefined) {
							data.attributes[name] = getMedian(numbers)

							const median = medians.get(`${MedianSelectors.MEDIAN}${parentSelector}`)
							if (median === undefined) {
								medians.set(`${MedianSelectors.MEDIAN}${parentSelector}`, numbers)
							} else {
								pushSortedArray(median, numbers)
							}
						}

						if (isDeltaState) {
							const deltaNumbers = medians.get(`${MedianSelectors.DELTA}${selector}`)
							if (deltaNumbers !== undefined) {
								data.deltas[name] = getMedian(deltaNumbers)

								const median = medians.get(`${MedianSelectors.DELTA}${parentSelector}`)
								if (median === undefined) {
									medians.set(`${MedianSelectors.DELTA}${parentSelector}`, deltaNumbers)
								} else {
									pushSortedArray(median, deltaNumbers)
								}
							}
						}
					}

					// Collect medians
					const median = medians.get(`${MedianSelectors.MEDIAN}${parentSelector}`)
					if (median === undefined) {
						medians.set(`${MedianSelectors.MEDIAN}${parentSelector}`, [data.attributes[name]])
					} else if (isLeaf(data)) {
						pushSorted(median, data.attributes[name])
					}
					if (isDeltaState) {
						const median = medians.get(`${MedianSelectors.DELTA}${parentSelector}`)
						if (median === undefined) {
							medians.set(`${MedianSelectors.DELTA}${parentSelector}`, [data.deltas[name]])
						} else if (isLeaf(data)) {
							pushSorted(median, data.deltas[name])
						}
					}
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

				// Skip 0 values
				if (!value) {
					continue
				}

				const selector = `${name}${data.path}`
				const parentSelector = `${name}${parent.data.path}`

				if (attributeTypes.edges[name] === AttributeTypeValue.relative) {
					// Set median to parents
					if (!isLeaf(data)) {
						const incomingNumbers = medians.get(`${MedianSelectors.INCOMING}${selector}`)
						if (incomingNumbers !== undefined) {
							data.edgeAttributes[name].incoming = getMedian(incomingNumbers)

							const median = medians.get(`${MedianSelectors.INCOMING}${parentSelector}`)
							if (median === undefined) {
								medians.set(`${MedianSelectors.INCOMING}${parentSelector}`, incomingNumbers)
							} else {
								pushSortedArray(median, incomingNumbers)
							}
						}

						const outgoingNumbers = medians.get(`${MedianSelectors.OUTGOING}${selector}`)
						if (outgoingNumbers !== undefined) {
							data.edgeAttributes[name].outgoing = getMedian(outgoingNumbers)

							const median = medians.get(`${MedianSelectors.OUTGOING}${parentSelector}`)
							if (median === undefined) {
								medians.set(`${MedianSelectors.OUTGOING}${parentSelector}`, outgoingNumbers)
							} else {
								pushSortedArray(median, outgoingNumbers)
							}
						}
					}

					// Collect incoming edges
					const incomingMedians = medians.get(`${MedianSelectors.INCOMING}${parentSelector}`)
					if (incomingMedians === undefined) {
						medians.set(`${MedianSelectors.INCOMING}${parentSelector}`, [value.incoming])
					} else if (isLeaf(data)) {
						pushSorted(incomingMedians, value.incoming)
					}

					// Collect outgoing edged
					const outgoingMedians = medians.get(`${MedianSelectors.OUTGOING}${parentSelector}`)
					if (incomingMedians === undefined) {
						medians.set(`${MedianSelectors.OUTGOING}${parentSelector}`, [value.outgoing])
					} else if (isLeaf(data)) {
						pushSorted(outgoingMedians, value.outgoing)
					}
				} else {
					// console.log(`Summing from ${  data.path  } to ${  parent.data.path}`)
					// console.log("map before:", JSON.stringify(map))
					parent.data.edgeAttributes[name].incoming += value.incoming
					// console.log("map after", JSON.stringify(map))
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

function isLeaf(node: CodeMapNode) {
	return !node.children || node.children.length === 0
}

function getMedian(numbers: number[]) {
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
