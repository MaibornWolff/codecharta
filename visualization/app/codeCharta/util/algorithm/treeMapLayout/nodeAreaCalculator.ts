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

	let proportionMax = 0
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path
			const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
			const proportion = parentArea / nodeAreaMap[parentPath]
			proportionMax = proportionMax > proportion ? proportionMax : proportion
		}
	}

	// == Up to here it reproduces the old functionality ==

	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			nodeAreaMap[nodePath] = Math.round(nodeAreaMap[nodePath] * proportionMax)
		} else {
			nodeAreaMap[nodePath] = 0
		}
	}

	//	console.log(inspect(nodeAreaMap))

	// iterate paths array
	// if file:
	// get Parent and calculate its new size using padding
	// calculate proportion and scale file value
	//if folder:
	// due to traversing order we can now increase value by padding

	const metricSum = hierarchyNode.sum(node => {
		return nodeAreaMap[node.path]
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
