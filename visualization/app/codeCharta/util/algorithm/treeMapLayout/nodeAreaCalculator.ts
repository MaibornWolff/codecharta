import { HierarchyNode } from "d3-hierarchy"
import { getAreaValue } from "./treeMapGenerator"
import { State } from "../../../codeCharta.model"
import { getParent } from "../../nodePathHelper"
import { isLeaf } from "../../codeMapHelper"
//import {inspect} from "util";

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
	const nodeAreaMap = new Map()
	hierarchyNode.each(node => {
		nodeKeyMap.set(node.data.path, node)
		// TODO: Refactor to JSON object in one map
		nodeAreaMap.set(node.data.path, 0)
	})

	// calculate area values for leafs and folders considering direct children
	for (const [nodeKey, nodeValue] of nodeKeyMap) {
		nodeAreaMap[nodeKey] = getAreaValue(nodeValue.data, state)

		if (nodeValue.data.type === "Folder") {
			const totalChildrenArea = nodeValue.data.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)

			if (totalChildrenArea !== 0) {
				nodeAreaMap[nodeKey] = totalChildrenArea
			}
		}
	}

	const paths = [...nodeKeyMap.keys()].reverse()

	// add children folder areas to direct children folder area
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "Folder") {
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path

			nodeAreaMap[parentPath] = nodeAreaMap[parentPath] + nodeAreaMap[nodePath]
		}
	}

	// == Up to here it reproduces the old functionality ==

	// iterate paths array
	// if file:
	// get Parent and calculate its new size using padding
	// calculate proportion and scale file value
	//if folder:
	// due to traversing order we can now increase value by padding

	//Calculate the scaling factor
	let proportionMax = 0
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path
			if(nodeAreaMap[parentPath] > 0) {
				const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
				const proportion = parentArea / nodeAreaMap[parentPath]

				proportionMax = proportionMax > proportion ? proportionMax : proportion
			}
		}
	}


	// Apply scaling factor to files only
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			nodeAreaMap[nodePath] = Math.round(nodeAreaMap[nodePath] * proportionMax)
		} else {
			// The folders area are set to 0; because of D3
			nodeAreaMap[nodePath] = 0
		}
	}

	const metricSum = hierarchyNode.sum(node => {
		if(nodeAreaMap[node.path] > 0) {
			return nodeAreaMap[node.path]
		}
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
	return Math.round((Math.sqrt(area) + padding * 2) ** 2)
}
