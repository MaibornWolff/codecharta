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

const HUGE_MAP = 15_000
const BIG_MAP = 10_000
const HUGE_MAP_FACTOR = 0.35
const BIG_MAP_FACTOR = 0.5

const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 = 120
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 95
const PADDING_APPROX_FOR_DEPTH_ZERO = 0.035
const PADDING_APPROX_FOR_DEPTH_ONE = 0.028

export function calculateTotalNodeArea(
	buildingAreasIncludingPadding: number[],
	hierarchyNode: HierarchyNode<CodeMapNode>,
	padding: number,
	state: State
) {
	/**
	 * Step 1:
	 */

	if (buildingAreasIncludingPadding.length === 0) {
		throw new Error("No buildings with an area bigger 0 exist for this metric")
	}

	let totalNodeArea = buildingAreasIncludingPadding.reduce((intermediate, current) => intermediate + current)

	/**
	 * Step 2: Map(node_path: (node, 0))
	 */
	const nodeKeyMap = new Map()
	const nodeAreaMap = new Map()
	hierarchyNode.each(node => {
		nodeKeyMap.set(node.data.path, node)
		// TODO: Refactor to JSON object in one map
		nodeAreaMap.set(node.data.path, 0)
	})

	/**
	 * Step 3:
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
	for (const nodePath of paths) {
		if (nodeKeyMap.get(nodePath)?.data.type === "Folder") {
			const parent = getParent(nodeKeyMap, nodePath)
			const parentPath = parent?.data.path

			nodeAreaMap[parentPath] = nodeAreaMap[parentPath] + nodeAreaMap[nodePath]
		}
	}

	/**
	 * Step 6:
	 */

	let amountOfDepthOne = 0
	let amountOfDepthTwo = 0

	for (const nodePath of paths) {
		const parent = getParent(nodeKeyMap, nodePath)
		const parentPath = parent?.data.path
		if (nodeKeyMap.get(nodePath)?.data.type === "File") {
			if (nodeAreaMap[parentPath] > 0) {
				const parentArea = addPaddingToArea(nodeAreaMap[parentPath], padding)
				const proportion = parentArea / nodeAreaMap[parentPath]
				nodeAreaMap[nodePath] = Math.ceil(nodeAreaMap[nodePath] * proportion)
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

	/**
	 * Step 7:
	 */
	hierarchyNode.sum(node => {
		return nodeAreaMap[node.path]
	})

	/**
	 * Step 8:
	 */
	for (const node of hierarchyNode) {
		if (!isLeaf(node.data) && node.value !== undefined) {
			const folderAreaValue = node.value
			totalNodeArea += (folderAreaValue + padding * 2) ** 2 - folderAreaValue ** 2
		}
	}

	/**
	 * Step 9:
	 */
	const defaultFolderLabelPadding = calculateFolderLabelPadding(
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0 * PADDING_APPROX_FOR_DEPTH_ZERO,
		DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)

	const rootWidthWithDefaultPadding = Math.sqrt(totalNodeArea) + defaultFolderLabelPadding

	/**
	 * Step 10:
	 */
	const shiftedFolderLabelPadding = calculateFolderLabelPadding(
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ZERO,
		rootWidthWithDefaultPadding * PADDING_APPROX_FOR_DEPTH_ONE,
		amountOfDepthOne,
		amountOfDepthTwo
	)

	/**
	 * Step 11:
	 */
	let rootSide = Math.max(rootWidthWithDefaultPadding, Math.sqrt(totalNodeArea + shiftedFolderLabelPadding ** 2))
	let factor = 1

	/**
	 * Step 12:
	 */
	if (rootSide > BIG_MAP) {
		factor = rootSide > HUGE_MAP ? HUGE_MAP_FACTOR : BIG_MAP_FACTOR
		rootSide = Math.max(rootWidthWithDefaultPadding * factor, Math.sqrt(totalNodeArea + shiftedFolderLabelPadding ** 2) * factor)
	}

	/**
	 * Step 13:
	 */
	const rootHeight = Math.ceil(rootSide)
	const rootWidth = Math.ceil(rootSide)

	const metricSum = hierarchyNode.sum(node => {
		return nodeAreaMap[node.path] * factor
	})

	return { rootWidth, rootHeight, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return Math.ceil((Math.sqrt(area) + padding) ** 2)
}
