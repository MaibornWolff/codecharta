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
		return buildSquarifiedTreeMapsForFixedFolders(map, state, heightScale, maxHeight, isDeltaState)
	}

	const squarifiedTreeMap = getSquarifiedTreeMap(map, state)

	const nodes = []
	for (const squarifiedNode of squarifiedTreeMap.treeMap) {
		nodes.push(TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState))
	}
	return nodes
}

function buildSquarifiedTreeMapsForFixedFolders(
	map: CodeMapNode,
	state: State,
	heightScale: number,
	maxHeight: number,
	isDeltaState: boolean
) {
	const hierarchyNode = hierarchy(map)

	const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(map, heightScale, state, isDeltaState)]
	const scale =
		(state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].length

	scaleRoot(nodes[0], scale)

	for (const fixedFolder of map.children) {
		const squarified = getSquarifiedTreeMap(fixedFolder, state)
		for (const squarifiedNode of squarified.treeMap.descendants()) {
			scaleAndTranslateSquarifiedNode(squarifiedNode, fixedFolder, squarified, scale)
			const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
			nodes.push(node)
		}
	}
	return nodes
}

function hasFixedFolders(map: CodeMapNode) {
	return Boolean(map.children[0]?.fixedPosition)
}

function scaleAndTranslateSquarifiedNode(
	squarifiedNode: HierarchyRectangularNode<CodeMapNode>,
	fixedFolder: CodeMapNode,
	squarified: SquarifiedTreeMap,
	scale: number
) {
	// Transform coordinates from local folder space to world space (between 0 and 100).
	const scaleX = fixedFolder.fixedPosition.width / squarified.width
	const scaleY = fixedFolder.fixedPosition.height / squarified.height

	// Scales to usual map-size of 500 matching the three-scene-size
	squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedFolder.fixedPosition.left) * scale
	squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedFolder.fixedPosition.left) * scale
	squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedFolder.fixedPosition.top) * scale
	squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedFolder.fixedPosition.top) * scale
}

function scaleRoot(root: Node, scale: number) {
	root.x0 *= scale
	root.y0 *= scale
	root.width *= scale
	root.length *= scale
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

	const width = mapWidth + nodesPerSide * state.dynamicSettings.margin
	const height = mapHeight + nodesPerSide * state.dynamicSettings.margin

	const treeMap = treemap<CodeMapNode>().size([width, height]).paddingOuter(padding).paddingInner(padding)

	return { treeMap: treeMap(hierarchyNode.sum((node) => calculateAreaValue(node, state))), height, width }
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
