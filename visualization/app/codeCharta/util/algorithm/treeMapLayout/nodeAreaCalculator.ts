import { HierarchyNode } from "d3-hierarchy"
import {
	DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0,
	DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1,
	FOLDER_LABEL_TOO_SMALL_PARENT,
	getAreaValue,
	PADDING_APPROX_FOR_DEPTH_ONE,
	PADDING_APPROX_FOR_DEPTH_ZERO
} from "./treeMapGenerator"
import { CodeMapNode, State } from "../../../codeCharta.model"
import { getParent } from "../../nodePathHelper"
import { isLeaf } from "../../codeMapHelper"

const BIG_MAP = 40_000

export function calculateTotalNodeArea(buildingAreas: number[], hierarchyNode: HierarchyNode<CodeMapNode>, padding: number, state: State) {
	/**
	 * Step 1:
	 */

	if (buildingAreas.length === 0) {
		throw new Error("No buildings with an area bigger 0 exist for this metric")
	}

	let totalNodeArea = buildingAreas.reduce((intermediate, current) => intermediate + current + addPaddingToArea(current, padding))

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
			nodeAreaMap[nodePath] = 0
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

			if (node.depth === 0) {
				totalNodeArea += Math.max(
					DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_0,
					Math.sqrt(folderAreaValue) * PADDING_APPROX_FOR_DEPTH_ZERO
				)
			}
			if (node.depth >= 1 && node.depth <= 2 && folderAreaValue / node.parent.value > FOLDER_LABEL_TOO_SMALL_PARENT) {
				totalNodeArea += Math.max(
					DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1,
					Math.sqrt(folderAreaValue) * PADDING_APPROX_FOR_DEPTH_ONE
				)
			}

			totalNodeArea += (folderAreaValue + folderAreaValue * 0.001 + padding * 2) ** 2 - folderAreaValue ** 2
		}
	}

	/**
	 * Step 9:
	 */
	let rootSide = Math.max(Math.sqrt(totalNodeArea))
	let factor = 1

	/**
	 * Step 10:
	 */
	if (rootSide > BIG_MAP) {
		factor = BIG_MAP / rootSide
		rootSide = rootSide * factor
	}

	/**
	 * Step 11:
	 */
	const rootHeight = Math.ceil(rootSide)
	const rootWidth = Math.ceil(rootSide)

	const metricSum = hierarchyNode.sum(node => {
		return nodeAreaMap[node.path] * factor
	})

	//TODO: Implement invert area here

	return { rootWidth, rootHeight, metricSum }
}

function addPaddingToArea(area: number, padding: number) {
	return Math.ceil((Math.sqrt(area) + padding) ** 2)
}
