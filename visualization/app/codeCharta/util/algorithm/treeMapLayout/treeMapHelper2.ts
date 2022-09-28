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

function getNonZeroMetrics(areaValues: number[]) {
	let index = 0
	while (areaValues[index] === 0) {
		index++
	}
	return areaValues.slice(index)
}

export function getSmallestDifference(childAreaValues: number[]) {
	let diff = Number.MAX_VALUE

	// childAreaValues is already sorted
	const smallestValue = childAreaValues[0]

	for (let index = 0; index < childAreaValues.length - 1; index++) {
		const intermediateDiff = Math.abs(childAreaValues[index + 1] - childAreaValues[index])
		if (intermediateDiff < diff && intermediateDiff > 0) {
			diff = intermediateDiff
		}
	}
	// Return min diff
	return Math.min(diff, smallestValue)
}

export function getChildrenAreaValues(hierarchyNode: HierarchyNode<CodeMapNode>, state: State) {
	return getNonZeroMetrics(getLeafValues(hierarchyNode, state))
}
