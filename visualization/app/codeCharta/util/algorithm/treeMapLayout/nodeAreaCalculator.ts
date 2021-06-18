import { isLeaf } from "../../codeMapHelper"
import { HierarchyNode } from "d3-hierarchy"
import { getAreaValue } from "./treeMapGenerator"
import { State } from "../../../codeCharta.model"
import { getParent } from "../../nodePathHelper"

export function calculateTotalNodeArea(
	buildingAreasIncludingPadding: number[],
	hierarchyNode: HierarchyNode<any>,
	padding: number,
	state: State
) {
	let totalNodeArea = buildingAreasIncludingPadding.reduce((intermediate, current) => intermediate + current)

	/**
	 * 1. Put each hierarchyNode element into a map
	 * 2. calculate correct value, including margins, for each node
	 * 3. hierarchyNode.sum: for each element sum its value saved in the map instead
	 */

	//  create 2 maps, one storing nodes, one calculated area values
	const nodeKeyMap = new Map()
	const nodeValueMap = new Map()
	hierarchyNode.each(node => {
		nodeKeyMap.set(node.data.path, node)
		nodeValueMap.set(node.data.path, 0)
	})

	// calculate area values for leafs and folders considering direct children
	for (const [nodeKey, nodeValue] of nodeKeyMap) {
		nodeValueMap[nodeKey] = getAreaValue(nodeValue.data, state)

		if (nodeValue.data.type === "Folder") {
			const totalChildrenArea = nodeValue.data.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)

			if (totalChildrenArea !== 0) {
				nodeValueMap[nodeKey] = totalChildrenArea
			}
		}
	}

	const paths = [...nodeKeyMap.keys()].reverse()

	// add children folder areas to direct children folder area
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "Folder") {
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path

			nodeValueMap[parentPath] = nodeValueMap[parentPath] + nodeValueMap[nodePath]
		}
	}

	// == Up to here it reproduces the old functionality ==

	// iterate paths array
	// if file:
	// get Parent and calculate its new size using padding
	// calculate proportion and scale file value
	//if folder:
	// due to traversing order we can now increase value by padding

	for (const [nodeKey, nodeValue] of nodeKeyMap) {
		if (isLeaf(nodeValue)) {
			const parent = getParent(nodeKeyMap, nodeKey)

			const parentArea = nodeValueMap[parent?.data.path]

			const proportion = nodeValue.parent.value / parentArea
			nodeValueMap[nodeKey] = nodeValueMap[nodeKey] * proportion
		}
	}

	hierarchyNode.sum(node => {
		const area = getAreaValue(node, state)

		if (isLeaf(node)) {
			return area
		}

		const totalChildrenArea = node.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)

		if (totalChildrenArea !== 0) {
			const newFolderArea = addPaddingToArea(totalChildrenArea, padding)
			return newFolderArea
		}

		return area // if child = 30 => 30(childArea)/100(folderArea) * 169(new folderArea) => newFolderArea/folderArea
	})

	const metricSum = hierarchyNode.sum(node => {
		if (!isLeaf(node) || node.parent === undefined) {
			return getAreaValue(node, state)
		}
		const parentArea = getAreaValue(node.parent, state)
		//console.log("Area", parentArea)
		const proportion = node.parent.value / parentArea
		return node.value * proportion
	})

	for (const node of hierarchyNode) {
		if (!isLeaf(node.data) && node.value !== undefined) {
			const folderAreaValue = node.value
			totalNodeArea += (folderAreaValue + padding) ** 2 - folderAreaValue ** 2 - padding
		}
	}

	const rootWidth = Math.sqrt(totalNodeArea)

	return { rootWidth, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return Math.round((Math.sqrt(area) + padding) ** 2) - area
}
