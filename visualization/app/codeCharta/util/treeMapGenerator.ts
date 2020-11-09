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

		const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, state, isDeltaState)]

		// Multiply mapSize of (default) 250px by 2 = 500px
		// and add the total margin
		const scaleLength = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].length
		const scaleWidth = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].width
		scaleRoot(nodes[0], scaleLength, scaleWidth)

		buildSquarifiedTreeMapsForFixedFolders(nodes, hierarchyNode, state, scaleLength, scaleWidth, 0, 0, heightScale, maxHeight, isDeltaState)
		return nodes
	}

	const squarifiedTreeMap = getSquarifiedTreeMap(map, state)

	const nodes = []
	for (const squarifiedNode of squarifiedTreeMap.treeMap) {
		nodes.push(TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState))
	}
	return nodes
}

function buildSquarifiedTreeMapsForFixedFolders(
	nodes: Node[],
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
	for (const fixedFolder of hierarchyNode.children) {

		const squarified = getSquarifiedTreeMap(fixedFolder.data, state)

		for (const squarifiedNode of squarified.treeMap.descendants()) {
			// Transform coordinates from local folder space to parent folder space (between 0 and 100).
			// It calculates the space in the parent folder that the fixed folder takes in (in percentage).
			// Example: Parent Folder 200px width, (child) fixed folder width = 20 = 20% => 20 / 200 = 	0.1
			const scaleX = fixedFolder.data.fixedPosition.width / squarified.width
			const scaleY = fixedFolder.data.fixedPosition.height / squarified.height

			// Scales to usual map-size of 500 matching the three-scene-size
			squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedFolder.data.fixedPosition.left) * scaleLength
			squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedFolder.data.fixedPosition.left) * scaleLength
			squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedFolder.data.fixedPosition.top) * scaleWidth
			squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedFolder.data.fixedPosition.top) * scaleWidth

			// Add x and y offsets from parent fixed folder, if any.
			squarifiedNode.x0 += offsetX0
			squarifiedNode.x1 += offsetX0
			squarifiedNode.y0 += offsetY0
			squarifiedNode.y1 += offsetY0

			const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
			nodes.push(node)

			if (hasFixedFolders(fixedFolder.data)) {
				scaleLength = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / node.length
				scaleWidth = (state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / node.width

				buildSquarifiedTreeMapsForFixedFolders(nodes, fixedFolder, state, scaleLength, scaleWidth, squarifiedNode.x0, squarifiedNode.y0, heightScale, maxHeight, isDeltaState)

				// the break is actually needed!
				//TODO can we break the loop at an earlier point?
				// and check that really all fixed folder children will be processed.
				break
			}
		}
	}
}

function hasFixedFolders(map: CodeMapNode) {
	// What if the second child of root is the first fixed folder?
	// Assumption: all children of the root folder require the fixedPosition attribute.
	return Boolean(map.children[0]?.fixedPosition)
}

function scaleRoot(root: Node, scaleLength: number, scaleWidth: number) {
	root.x0 *= scaleLength
	root.y0 *= scaleWidth
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
