import { isLeaf } from "../../codeMapHelper"
import { getAreaValue } from "./treeMapGenerator"
import { HierarchyNode } from "d3-hierarchy"
import { CodeMapNode, State } from "../../../codeCharta.model"

function getLeafValues(hierarchyNode: HierarchyNode<CodeMapNode>, state: State) {
	const leafAreaValues = []
	for (const node of hierarchyNode) {
		if (isLeaf(node.data)) {
			leafAreaValues.push(getAreaValue(node.data, state))
		}
	}
	return leafAreaValues
}

function getMetricValuesFromFirstNonZero(areaValues: number[]) {
	areaValues.sort((a, b) => a - b)

	let index = 0
	while (areaValues[index] === 0) {
		index++
	}
	return areaValues.slice(index)
}

export function getSmallestValueOrSmallestDifference(childAreaValues: number[]) {
	let diff = Number.MAX_VALUE

	// childAreaValues is already sorted
	if (childAreaValues === undefined || childAreaValues === null) {
		return diff
	}

	const smallestValue = childAreaValues[0] ? childAreaValues[0] : diff

	for (let index = 0; index < childAreaValues.length - 1; index++) {
		const intermediateDiff = Math.abs(childAreaValues[index + 1] - childAreaValues[index])
		if (intermediateDiff < diff && intermediateDiff > 0) {
			diff = intermediateDiff
		}
	}
	// Return min diff
	return Math.max(1, Math.min(diff, smallestValue))
}

export function getChildrenAreaValues(hierarchyNode: HierarchyNode<CodeMapNode>, state: State) {
	return getMetricValuesFromFirstNonZero(getLeafValues(hierarchyNode, state))
}
