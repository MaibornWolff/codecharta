import { HierarchyNode } from "d3-hierarchy"
import { getAreaValue } from "./treeMapGenerator"
import { CodeMapNode, State } from "../../../codeCharta.model"
import { getParent } from "../../nodePathHelper"
import { isLeaf } from "../../codeMapHelper"

function calculateFolderLabelPadding(
	padding_root: number,
	padding_folder: number,
	amountOfFoldersDepthOne: number,
	amountOfFolderDepthTwo: number
) {
	return (
		padding_root +
		(padding_root + padding_folder * amountOfFoldersDepthOne) +
		(padding_root + padding_folder * amountOfFoldersDepthOne * amountOfFolderDepthTwo)
	)
}

export function calculateTotalNodeArea(
	buildingAreasIncludingPadding: number[],
	hierarchyNode: HierarchyNode<CodeMapNode>,
	padding: number,
	state: State
) {
	let totalNodeArea = buildingAreasIncludingPadding.reduce((intermediate, current) => intermediate + current)

	/**
	 * 1. Put each hierarchyNode element into a map
	 * 2. calculate correct value, including margins, for each node
	 * 3. hierarchyNode.sum: for each element sum its value saved in the map instead
	 */

	const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 120
	const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2 = 95
	const PADDING_APPROX_FOR_DEPTH_ZERO = 0.035
	const PADDING_APPROX_FOR_DEPTH_ONE = 0.028

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
			if (nodeAreaMap[parentPath] > 0) {
				const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
				const proportion = parentArea / nodeAreaMap[parentPath]

				proportionMax = proportionMax > proportion ? proportionMax : proportion
			}
		}
	}

	let amountOfDepthOne = 0
	let amountOfDepthTwo = 0

	// Apply scaling factor to files only
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			nodeAreaMap[nodePath] = Math.round(nodeAreaMap[nodePath] * proportionMax)
		} else {
			const node = nodeKeyMap.get(nodePath)
			switch (node.depth) {
				case 1: {
					amountOfDepthOne += 1
					nodeAreaMap[nodePath] = 0
					break
				}
				case 2: {
					amountOfDepthTwo += 1
					nodeAreaMap[nodePath] = 0
					break
				}
				default:
					nodeAreaMap[nodePath] = 0
					break
			}
		}
	}

	const metricSum = hierarchyNode.sum(node => {
		if (nodeAreaMap[node.path] > 0) {
			return nodeAreaMap[node.path]
		}
	})

	for (const node of hierarchyNode) {
		if (!isLeaf(node.data) && node.value !== undefined) {
			const folderAreaValue = node.value
			totalNodeArea += (folderAreaValue + padding) ** 2 - folderAreaValue ** 2 - padding
		}
	}

	const defaultFolderLabelPadding = calculateFolderLabelPadding(
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 * PADDING_APPROX_FOR_DEPTH_ZERO,
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2 * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)
	const rootWidthWithDefaultPadding = Math.sqrt(totalNodeArea + defaultFolderLabelPadding ** 2)
	const shiftedFolderLabelPadding = calculateFolderLabelPadding(
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ZERO,
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)

	const rootWidth = Math.max(rootWidthWithDefaultPadding, Math.sqrt(totalNodeArea + shiftedFolderLabelPadding ** 2))
	const rootHeight = Math.sqrt(totalNodeArea)

	return { rootWidth, rootHeight, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return Math.round((Math.sqrt(area) + padding * 2) ** 2)
}
