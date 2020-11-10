import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap } from "d3-hierarchy"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapNode, DynamicSettings, Node, NodeMetricData, State } from "../codeCharta.model"
import { isLeaf } from "./codeMapHelper"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

const PADDING_SCALING_FACTOR = 0.4

export function createTreemapNodes(map: CodeMapNode, state: State, metricData: NodeMetricData[], isDeltaState: boolean) {
	const maxHeight = metricData.find(x => x.name === state.dynamicSettings.heightMetric).maxValue
	const heightScale = (state.treeMap.mapSize * 2) / maxHeight

	if (hasFixedFolders(map)) {
		const hierarchyNode = hierarchy(map)

		// Base root folder has width: 100px and length: 100px
		const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, state, isDeltaState)]

		// Multiply mapSize of (default) 250px by 2 = 500px and add the total margin
		// than divide through the root folder width and length to get a scale factor for calculation for all following nodes.
		const scaleLength = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].width
		const scaleWidth = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].length

		// Scale the 100x100 root folder to a bigger map
		scaleRoot(nodes[0], scaleLength, scaleWidth)

		return nodes.concat(buildSquarifiedTreeMapsForFixedFolders(hierarchyNode, state, scaleLength, scaleWidth, 0, 0, heightScale, maxHeight, isDeltaState))
	}

	const squarifiedTreeMap = getSquarifiedTreeMap(map, state)

	const nodes = []
	for (const squarifiedNode of squarifiedTreeMap.treeMap) {
		nodes.push(TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState))
	}
	return nodes
}

function buildSquarifiedTreeMapsForFixedFolders(
	hierarchyNode: HierarchyNode<CodeMapNode>,
	state: State,
	scaleLength: number,
	scaleWidth: number,
	offsetX0: number,
	offsetY0: number,
	heightScale: number,
	maxHeight: number,
	isDeltaState: boolean
) {
	const nodes = []

	for (const fixedFolder of hierarchyNode.children) {

		const squarified = getSquarifiedTreeMap(fixedFolder.data, state)

		for (const squarifiedNode of squarified.treeMap.descendants()) {
			// squarified.width/height is a sum of the fixedPosition.width/height and applied margins
			// The following scaling factors are used later to calculate out the original percentage fixed width/height.
			// Example: Width and Height fixed at 20. Added margins 42px (absolute value) for each = 62px
			//  20/62 = 0.322...       62 x 0.322... = 20 :)
			const scaleX = fixedFolder.data.fixedPosition.width / squarified.width
			const scaleY = fixedFolder.data.fixedPosition.height / squarified.height

			// Scale the fixed (percentage) positions of a node by the right scale factor, so that it will be placed properly.
			squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedFolder.data.fixedPosition.left) * scaleWidth
			squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedFolder.data.fixedPosition.left) * scaleWidth
			squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedFolder.data.fixedPosition.top) * scaleLength
			squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedFolder.data.fixedPosition.top) * scaleLength

			// TODO: remove outcommented code. It is more intuitive but not working though.
			/*
			squarifiedNode.x0 = (0 + fixedFolder.data.fixedPosition.left) * scaleWidth
			squarifiedNode.x1 = squarifiedNode.x0 + (fixedFolder.data.fixedPosition.width * scaleWidth)
			squarifiedNode.y0 = (0 + fixedFolder.data.fixedPosition.top) * scaleLength
			squarifiedNode.y1 = squarifiedNode.y0 + (fixedFolder.data.fixedPosition.height * scaleLength)
			*/

			// Add x and y (absolute px) offsets from parent fixed folder, if any.
			squarifiedNode.x0 += offsetX0
			squarifiedNode.x1 += offsetX0
			squarifiedNode.y0 += offsetY0
			squarifiedNode.y1 += offsetY0

			const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
			nodes.push(node)

			if (hasFixedFolders(fixedFolder.data)) {
				// Imagine the parent Folder has absoulte px-width of 341px
				// We need to calculate a scale factor to transform a relative percentage fixed width/height to px.
				// Example: 20% of 341px:
				//  fixedWidth=20, parent Fixed Folder width: 341px => 20 * (scaleLength=341/100)
				scaleLength = node.length / 100
				scaleWidth = node.width / 100

				Array.prototype.push.apply(
					nodes,
					buildSquarifiedTreeMapsForFixedFolders(fixedFolder, state, scaleLength, scaleWidth, squarifiedNode.x0, squarifiedNode.y0, heightScale, maxHeight, isDeltaState)
				)

				// the break is actually needed!
				break
			}
		}
	}

	return nodes
}

function hasFixedFolders(map: CodeMapNode) {
	// What if the second child of root is the first fixed folder?
	// Assumption: all children of the root folder require the fixedPosition attribute.
	return Boolean(map.children[0]?.fixedPosition)
}

function scaleRoot(root: Node, scaleLength: number, scaleWidth: number) {
	root.x0 *= scaleWidth
	root.y0 *= scaleLength
	root.width *= scaleWidth
	root.length *= scaleLength
}

function getSquarifiedTreeMap(map: CodeMapNode, state: State): SquarifiedTreeMap {
	const hierarchyNode = hierarchy(map)
	const nodesPerSide = getEstimatedNodesPerSide(hierarchyNode)
	const padding = state.dynamicSettings.margin * PADDING_SCALING_FACTOR
	let mapWidth
	let mapHeight

	if (map.fixedPosition !== undefined) {
		mapWidth = map.fixedPosition.width
		mapHeight = map.fixedPosition.height
	} else {
		mapWidth = state.treeMap.mapSize * 2
		mapHeight = state.treeMap.mapSize * 2
	}

	// nodesPerSide is just an estimation.
	// We do not know the exact amount,
	// because the treemap algorithm is/must be executed with an initial width and height afterwards.
	// TODO If it is wrong some buildings might be cut off.
	const width = mapWidth + nodesPerSide * state.dynamicSettings.margin
	const height = mapHeight + nodesPerSide * state.dynamicSettings.margin

	const treeMap = treemap<CodeMapNode>().size([width, height]).paddingOuter(padding).paddingInner(padding)

	return { treeMap: treeMap(hierarchyNode.sum(node => calculateAreaValue(node, state))), height, width }
}

function getEstimatedNodesPerSide(hierarchyNode: HierarchyNode<CodeMapNode>) {
	let totalNodes = 0
	let blacklistedNodes = 0
	hierarchyNode.each(({ data }) => {
		if (data.isExcluded || data.isFlattened) {
			blacklistedNodes++
		}
		totalNodes++
	})

	// What does this line do?
	// Imagine a 3x3 grid of 9 nodes
	// 3 nodes are placed on the x-axis and 3 on the y-axis = 6
	// The calculated value is probably used to calculate the total margin which extends length and width of the map.
	return 2 * Math.sqrt(totalNodes - blacklistedNodes)
}

function isOnlyVisibleInComparisonMap(node: CodeMapNode, dynamicSettings: DynamicSettings) {
	return node.attributes[dynamicSettings.areaMetric] === 0 && node.deltas[dynamicSettings.heightMetric] < 0
}

// Only exported for testing.
export function calculateAreaValue(node: CodeMapNode, { dynamicSettings }: State) {
	if (node.isExcluded) {
		return 0
	}

	if (node.deltas && isOnlyVisibleInComparisonMap(node, dynamicSettings)) {
		return Math.abs(node.deltas[dynamicSettings.areaMetric])
	}

	if (isLeaf(node) && node.attributes?.[dynamicSettings.areaMetric]) {
		return node.attributes[dynamicSettings.areaMetric]
	}
	return 0
}
