import {isLeaf} from "../../codeMapHelper";
import {HierarchyNode} from "d3-hierarchy";
import {getAreaValue} from "./treeMapGenerator";
import {State} from "../../../codeCharta.model";
import {getParent} from "../../nodePathHelper";

export function calculateTotalNodeArea(buildingAreasIncludingPadding: number[], hierarchyNode: HierarchyNode<any>, padding:number, state: State) {
	let totalNodeArea = buildingAreasIncludingPadding.reduce((intermediate, current) => intermediate + current)

	/**
	 * 1. Put each hierarchyNode element into a map
	 * 2. calculate correct value, including margins, for each node
	 * 3. hierarchyNode.sum: for each element sum its value saved in the map instead
	 */


	const hierarchyNodeMap = new Map()
	const nodeValueMap = new Map()
	hierarchyNode.eachBefore(node => {
		hierarchyNodeMap.set(node.data.path, node)
		nodeValueMap.set(node.data.path, 0)
	})

	for (const [nodeKey, nodeValue] of hierarchyNodeMap.entries()) {
		if (nodeKey && nodeValue !== undefined && nodeValue.data !== undefined) {
			const area = getAreaValue(nodeValue.data, state)
			if (nodeValue.data.type === "File") {
				nodeValueMap[nodeKey] = area
			} else {
				const totalChildrenArea = nodeValue.data.children.reduce((sum, node) => getAreaValue(node, state) + sum, 0)
				if (totalChildrenArea !== 0) {

					const newFolderArea = addPaddingToArea(totalChildrenArea, padding)
					nodeValueMap[nodeKey] = newFolderArea

				}
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

			return area  // if child = 30 => 30(childArea)/100(folderArea) * 169(new folderArea) => newFolderArea/folderArea
		})

		const metricSum = hierarchyNode.sum(node => {
			if (!isLeaf(node) || node.parent === undefined) {
				return getAreaValue(node, state)
			}
			const parentArea = getAreaValue(node.parent, state)
			console.log("Area", parentArea)
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

		return {rootWidth, metricSum}
	}

	function addPaddingToArea(area: number, padding: number) {
		return Math.round((Math.sqrt(area) + padding) ** 2) - area
	}
}
