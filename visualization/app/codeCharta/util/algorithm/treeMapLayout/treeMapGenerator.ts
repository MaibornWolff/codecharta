import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap } from "d3-hierarchy"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapNode, DynamicSettings, Node, NodeMetricData, State } from "../../../codeCharta.model"
import { getMapResolutionScaleFactor, isLeaf } from "../../codeMapHelper"
import { calculatePadding } from "./paddingCalculator"
import { getChildrenAreaValues, getSmallestDifference } from "./treeMapHelper2"
import { calculateTotalNodeArea } from "./nodeAreaCalculator"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

const PADDING_SCALING_FACTOR = 1

export function createTreemapNodes(map: CodeMapNode, state: State, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
	const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
	const maxHeight = metricData.find(x => x.name === state.dynamicSettings.heightMetric).maxValue * mapSizeResolutionScaling
	const heightScale = (state.treeMap.mapSize * 2) / maxHeight

	if (hasFixedFolders(map)) {
		const hierarchyNode = hierarchy(map)

		// Base root folder has width: 100px and length: 100px
		const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, state, isDeltaState)] // nosonar

		// Multiply mapSize of (default) 250px by 2 = 500px and add the total margin
		const totalMapSize =
			state.treeMap.mapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * (state.dynamicSettings.margin / PADDING_SCALING_FACTOR)

		// than divide through the root folder width and length to get a scale factor for calculation for all following nodes.
		const scaleLength = totalMapSize / nodes[0].width
		const scaleWidth = totalMapSize / nodes[0].length

		// Scale the 100x100 root folder to a bigger map
		scaleRoot(nodes[0], scaleLength, scaleWidth)

		return [
			...nodes,
			...buildSquarifiedTreeMapsForFixedFolders(
				hierarchyNode,
				state,
				scaleLength,
				scaleWidth,
				0,
				0,
				heightScale,
				maxHeight,
				isDeltaState,
				mapSizeResolutionScaling
			)
		]
	}

	const squarifiedTreeMap = getSquarifiedTreeMap(map, state)

	const nodes: Node[] = []
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
	isDeltaState: boolean,
	mapSizeResolutionScaling: number
) {
	const nodes = []

	for (const fixedFolder of hierarchyNode.children) {
		const fixedPosition = fixedFolder.data.fixedPosition
		const squarified = getSquarifiedTreeMap(fixedFolder.data, state)

		for (const squarifiedNode of squarified.treeMap.descendants()) {
			// squarified.width/height is a sum of the fixedPosition.width/height and applied margins
			// The following scaling factors are used later to calculate out the original percentage fixed width/height.
			// Example: Width and Height fixed at 20. Added margins 42px (absolute value) for each = 62px
			//  20/62 = 0.322...       62 x 0.322... = 20 :)
			const scaleX = fixedPosition.width / squarified.width
			const scaleY = fixedPosition.height / squarified.height

			// Scale the fixed (percentage) positions of a node by the right scale factor, so that it will be placed properly.
			// The squarifiedNode coordinates x0, x1, y0, y1 are already assigned with positions from the treemap algorithm.
			squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedPosition.left) * scaleWidth
			squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedPosition.left) * scaleWidth
			squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedPosition.top) * scaleLength
			squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedPosition.top) * scaleLength

			// Add x and y (absolute px) offsets from parent fixed folder, if any.
			squarifiedNode.x0 += offsetX0
			squarifiedNode.x1 += offsetX0
			squarifiedNode.y0 += offsetY0
			squarifiedNode.y1 += offsetY0

			const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
			nodes.push(node)

			if (hasFixedFolders(fixedFolder.data)) {
				// Imagine the parent Folder has absolute px-width of 341px
				// We need to calculate a scale factor for the fixed child to transform a relative percentage fixed width/height to px.
				// Example: 20% of 341px:
				//  fixedWidth=20, parent Fixed Folder width: 341px => 20 * (scaleLength=341/100)
				// The original scaleWidth/scaleLength must be retained for the case that you have more than one fixedFolder on the same level.
				const childRelativeLengthScale = node.length / 100
				const childRelativeWidthScale = node.width / 100

				Array.prototype.push.apply(
					nodes,
					buildSquarifiedTreeMapsForFixedFolders(
						fixedFolder,
						state,
						childRelativeLengthScale,
						childRelativeWidthScale,
						squarifiedNode.x0,
						squarifiedNode.y0,
						heightScale,
						maxHeight,
						isDeltaState,
						mapSizeResolutionScaling
					)
				)

				// the break is actually needed!
				// the inner for-loop loops over the (parent) fixedFolder and its descendants.
				// if a direct child is a fixedFolder as well it will be handled by the recursive function call.
				// In this case, we must break the inner loop after handling the fixedFolder child recursively
				// and therefore prevent that the fixed child will be added as a node twice.
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

function getBuildingAreasWithProportionalPadding(
	childrenAreaValue: any[],
	smallestDelta: number,
	minimumBuildingSize: number,
	padding: number
) {
	return childrenAreaValue.map(element => {
		const buildingArea = (element / smallestDelta) * minimumBuildingSize
		return (Math.sqrt(buildingArea) + padding) ** 2
	})
}

function getSquarifiedTreeMap(map: CodeMapNode, state: State): SquarifiedTreeMap {
	const hierarchyNode = hierarchy(map)
	let padding = state.dynamicSettings.margin

	const childrenAreaValues = getChildrenAreaValues(hierarchyNode, state)

	const smallestDelta = getSmallestDifference(childrenAreaValues)

	const minBuildingSize = 100

	padding = calculatePadding(childrenAreaValues, smallestDelta, minBuildingSize, padding)
	//console.log("Padding ", padding)

	const metricBuildingAreasIncludingPadding = getBuildingAreasWithProportionalPadding(
		childrenAreaValues,
		smallestDelta,
		minBuildingSize,
		padding
	)

	const { rootWidth, metricSum } = calculateTotalNodeArea(metricBuildingAreasIncludingPadding, hierarchyNode, padding, state)

	const width = rootWidth
	const height = rootWidth

	const treeMap = treemap<CodeMapNode>()
		.size([width, height]) // padding does not need to be divided by 2, already calculated by d3-hierarchy
		.paddingOuter(padding) // padding of the element; applied to leaves
		.paddingInner(padding) // margin of the element; applied to folders

	const logSum = treeMap(metricSum)

	return { treeMap: logSum, height, width }
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
export function getAreaValue(node: CodeMapNode, { dynamicSettings }: State) {
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
