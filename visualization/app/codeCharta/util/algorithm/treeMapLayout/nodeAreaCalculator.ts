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
	return padding_root + padding_folder * amountOfFoldersDepthOne + padding_folder * amountOfFolderDepthTwo
}

export function calculateTotalNodeArea(
	buildingAreasIncludingPadding: number[],
	hierarchyNode: HierarchyNode<CodeMapNode>,
	padding: number,
	state: State
) {
	/**
	 * Step 1: Fix, this should throw error
	 */

	if (buildingAreasIncludingPadding.length === 0) {
		return {
			rootWidth: 0,
			rootHeight: 0,
			metricSum: hierarchyNode.sum(() => {
				return 0
			})
		}
	}

	let totalNodeArea = buildingAreasIncludingPadding.reduce((intermediate, current) => intermediate + current)

	/**
	 * 1. Put each hierarchyNode element into a map
	 * 2. calculate correct value, including margins, for each node
	 * 3. hierarchyNode.sum: for each element sum its value saved in the map instead
	 */

	const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 = 120
	const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 95
	const PADDING_APPROX_FOR_DEPTH_ZERO = 0.035
	const PADDING_APPROX_FOR_DEPTH_ONE = 0.028

	//  create 2 maps, one storing nodes, one calculated area values
	/**
	 * Step 2: Map(node_path: (node, 0))
	 */
	const nodeKeyMap = new Map()
	const nodeAreaMap = new Map()
	hierarchyNode.each(node => {
		nodeKeyMap.set(node.data.path, node) // d3-hierarchy node will place this
		// TODO: Refactor to JSON object in one map
		nodeAreaMap.set(node.data.path, 0) // areas; width/height calculation
	})

	// calculate area values for leafs and folders considering direct children
	/**
	 * Step 3: Fo1(F1,F2,Fo2(F3,F4))
	 */
	for (const [nodeKey, nodeValue] of nodeKeyMap) {
		nodeAreaMap[nodeKey] = getAreaValue(nodeValue.data, state)

		if (nodeValue.data.type === "Folder") {
			const totalChildrenArea = nodeValue.data.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)

			if (totalChildrenArea !== 0) {
				nodeAreaMap[nodeKey] = totalChildrenArea
			}
		}
	}

	/**
	 * Step 4:
	 */
	const paths = [...nodeKeyMap.keys()].reverse()

	/**
	 * Step 5:
	 */
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
	/**
	 * Step 6: Investigate, heuristic we should not use maximum
	 */

	let amountOfDepthOne = 0
	let amountOfDepthTwo = 0

	// Apply scaling factor to files only
	/**
	 * Step 7:
	 */
	for (const nodePath of paths) {
		const parent = getParent(nodeKeyMap, nodePath)
		const parentPath = parent?.data.path
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			if (nodeAreaMap[parentPath] > 0) {
				const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
				const proportion = parentArea / nodeAreaMap[parentPath]
				nodeAreaMap[nodePath] = Math.round(nodeAreaMap[nodePath] * proportion)
			}
		} else {
			const node = nodeKeyMap.get(nodePath)

			nodeAreaMap[nodePath] = 0

			switch (node.depth) {
				case 1: {
					const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
					const folderLabelCheck = parentArea / addPaddingToArea(nodeAreaMap[nodePath], padding)

					if (folderLabelCheck > 0.09) {
						amountOfDepthOne += 1
					}
					break
				}
				case 2: {
					const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
					const folderLabelCheck = parentArea / addPaddingToArea(nodeAreaMap[nodePath], padding)

					if (folderLabelCheck > 0.09) {
						amountOfDepthTwo += 1
					}
					break
				}
			}
		}
	}

	//const hierarchyNodeCopy = hierarchyNode.copy()

	/**
	 * Step 8: if
	 */
	hierarchyNode.sum(node => {
		return nodeAreaMap[node.path]
	})

	/**
	 * Step 9: width:x height:y; totalNodeArea = x * y; padding: folder -> file
	 */
	for (const node of hierarchyNode) {
		if (!isLeaf(node.data) && node.value !== undefined) {
			const folderAreaValue = node.value
			totalNodeArea += (folderAreaValue + padding) ** 2 - folderAreaValue ** 2
		}
	}

	/**
	 * Step 10:
	 */
	const defaultFolderLabelPadding = calculateFolderLabelPadding(
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 * PADDING_APPROX_FOR_DEPTH_ZERO,
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)

	const rootWidthWithDefaultPadding = Math.sqrt(totalNodeArea) + defaultFolderLabelPadding

	/**
	 * Step 11:
	 */
	const shiftedFolderLabelPadding = calculateFolderLabelPadding(
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ZERO,
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)

	let rootSide = Math.max(rootWidthWithDefaultPadding, Math.sqrt(totalNodeArea + shiftedFolderLabelPadding ** 2))
	let factor = 1
	/**
	 * Step 12:
	 */

	if (rootSide > 10_000) {
		factor = rootSide > 15_000 ? 0.35 : 0.5
		rootSide = Math.max(rootWidthWithDefaultPadding * factor, Math.sqrt(totalNodeArea + shiftedFolderLabelPadding ** 2) * factor)
	}

	const rootHeight = Math.round(rootSide)
	const rootWidth = Math.round(rootSide)

	const metricSum = hierarchyNode.sum(node => {
		return nodeAreaMap[node.path] * factor
	})

	return { rootWidth, rootHeight, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return Math.round((Math.sqrt(area) + padding * 2) ** 2)
}
