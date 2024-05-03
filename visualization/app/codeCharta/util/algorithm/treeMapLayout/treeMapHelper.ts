import { getMapResolutionScaleFactor, getMarkingColor, isLeaf } from "../../codeMapHelper"
import { CcState, CodeMapNode, ColorMode, Node } from "../../../codeCharta.model"
import { Vector3 } from "three"
import { CodeMapBuilding } from "../../../ui/codeMap/rendering/codeMapBuilding"
import { HierarchyRectangularNode } from "d3-hierarchy"
import { searchedNodePathsSelector } from "../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { gradientCalculator } from "../../color/gradientCalculator"
import {
	MetricMinMax,
	selectedColorMetricDataSelector
} from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

export const treeMapSize = 250

const FOLDER_HEIGHT = 2
const MIN_BUILDING_HEIGHT = 2
const HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0

function countNodes(node: { children?: CodeMapNode[] }) {
	let count = 1
	if (node.children) {
		for (const child of node.children) {
			count += countNodes(child)
		}
	}
	return count
}

// TODO this function exists twice in the code - please refactor it.
function calculateSize(node: CodeMapNode, metricName: string) {
	let totalSize = node.attributes[metricName] || 0

	if (totalSize === 0 && node.children && node.children.length > 0) {
		for (const child of node.children) {
			totalSize += calculateSize(child, metricName)
		}
	}
	return totalSize
}

function buildingArrayToMap(highlighted: CodeMapBuilding[]) {
	const geomMap: Map<number, CodeMapBuilding> = new Map()

	for (const building of highlighted) {
		geomMap.set(building.id, building)
	}

	return geomMap
}

function buildRootFolderForFixedFolders(map: CodeMapNode, heightScale: number, state: CcState, isDeltaState: boolean) {
	const flattened = isNodeFlat(map, state)
	const height = FOLDER_HEIGHT
	const width = 100
	const length = 100

	return {
		name: map.name,
		id: 0,
		width,
		height,
		length,
		depth: 0,
		x0: 0,
		z0: 0,
		y0: 0,
		isLeaf: false,
		attributes: map.attributes,
		edgeAttributes: map.edgeAttributes,
		deltas: map.deltas,
		heightDelta: (map.deltas?.[state.dynamicSettings.heightMetric] ?? 0) * heightScale,
		visible: isVisible(map, false, state, flattened),
		path: map.path,
		link: map.link,
		markingColor: getMarkingColor(map, state.fileSettings.markedPackages),
		flat: false,
		color: getBuildingColor(map, state, selectedColorMetricDataSelector(state), isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, height, length, new Vector3(0, 0, 0), treeMapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, height, length, new Vector3(0, 0, 0), treeMapSize)
	} as Node
}

function buildNodeFrom(
	squaredNode: HierarchyRectangularNode<CodeMapNode>,
	heightScale: number,
	maxHeight: number,
	state: CcState,
	isDeltaState: boolean
): Node {
	const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
	const { x0, x1, y0, y1, data } = squaredNode
	const isNodeLeaf = isLeaf(squaredNode)
	const flattened = isNodeFlat(data, state)
	const heightValue = getHeightValue(state, squaredNode, maxHeight, flattened)
	const depth = data.path.split("/").length - 2
	const height = isNodeLeaf ? resolveHeightValue(heightValue, heightScale, data, state) * mapSizeResolutionScaling : FOLDER_HEIGHT
	const width = x1 - x0
	const length = y1 - y0
	const z0 = squaredNode.depth * FOLDER_HEIGHT
	const heightDelta = (data.deltas?.[state.dynamicSettings.heightMetric] ?? 0) * heightScale * mapSizeResolutionScaling
	const edgePointHeight = height + (heightDelta < 0 ? Math.abs(heightDelta) : 0)

	return {
		name: data.name,
		id: data.id,
		width,
		height,
		length,
		depth,
		mapNodeDepth: squaredNode.depth,
		x0,
		z0,
		y0,
		isLeaf: isNodeLeaf,
		attributes: data.attributes,
		edgeAttributes: data.edgeAttributes,
		deltas: data.deltas,
		heightDelta,
		visible: isVisible(data, isNodeLeaf, state, flattened),
		path: data.path,
		link: data.link,
		markingColor: getMarkingColor(data, state.fileSettings.markedPackages),
		flat: flattened,
		color: getBuildingColor(data, state, selectedColorMetricDataSelector(state), isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, edgePointHeight, length, new Vector3(x0, z0, y0), treeMapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, edgePointHeight, length, new Vector3(x0, z0, y0), treeMapSize)
	}
}

export function getHeightValue(state: CcState, squaredNode: HierarchyRectangularNode<CodeMapNode>, maxHeight: number, flattened: boolean) {
	const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

	if (flattened) {
		return MIN_BUILDING_HEIGHT
	}

	let heightValue = squaredNode.data.attributes[state.dynamicSettings.heightMetric] || HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND
	heightValue *= mapSizeResolutionScaling

	if (state.appSettings.invertHeight) {
		return maxHeight - heightValue
	}
	return heightValue
}

export function resolveHeightValue(heightValue: number, heightScale: number, data: CodeMapNode, state: CcState): number {
	const minimalHeight = data.deltas?.[state.dynamicSettings.heightMetric] ? 0 : MIN_BUILDING_HEIGHT
	return Math.max(Math.abs(heightScale * heightValue), minimalHeight)
}

export function isVisible(squaredNode: CodeMapNode, isNodeLeaf: boolean, state: CcState, flattened: boolean) {
	if (squaredNode.isExcluded || (isNodeLeaf && state.appSettings.hideFlatBuildings && flattened)) {
		return false
	}

	if (state.dynamicSettings.focusedNodePath.length > 0) {
		return squaredNode.path.startsWith(state.dynamicSettings.focusedNodePath[0])
	}

	return true
}

export function getIncomingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
	if (width > length) {
		return new Vector3(vector.x - mapSize + width / 4, vector.y + height, vector.z - mapSize + length / 2)
	}
	return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + length / 4)
}

export function getOutgoingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
	if (width > length) {
		return new Vector3(vector.x - mapSize + 0.75 * width, vector.y + height, vector.z - mapSize + length / 2)
	}
	return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + 0.75 * length)
}

export function isNodeFlat(codeMapNode: CodeMapNode, state: CcState) {
	if (codeMapNode.isFlattened) {
		return true
	}

	const searchedNodePaths = searchedNodePathsSelector(state)

	if (searchedNodePaths && state.dynamicSettings.searchPattern?.length > 0) {
		return searchedNodePaths.size === 0 || isNodeNonSearched(codeMapNode, state)
	}

	if (state.appSettings.showOnlyBuildingsWithEdges && state.fileSettings.edges.some(edge => edge.visible)) {
		return nodeHasNoVisibleEdges(codeMapNode, state)
	}

	return false
}

function nodeHasNoVisibleEdges(codeMapNode: CodeMapNode, state: CcState) {
	return (
		codeMapNode.edgeAttributes[state.dynamicSettings.edgeMetric] === undefined ||
		!state.fileSettings.edges.some(edge => codeMapNode.path === edge.fromNodeName || codeMapNode.path === edge.toNodeName)
	)
}

function isNodeNonSearched(squaredNode: CodeMapNode, state: CcState) {
	const searchedNodePaths = searchedNodePathsSelector(state)
	return !searchedNodePaths.has(squaredNode.path)
}

export function getBuildingColor(
	node: CodeMapNode,
	{ appSettings, dynamicSettings }: CcState,
	nodeMetricDataRange: MetricMinMax,
	isDeltaState: boolean,
	flattened: boolean
) {
	const { mapColors } = appSettings

	if (isDeltaState) {
		return mapColors.base
	}
	const metricValue = node.attributes[dynamicSettings.colorMetric]

	if (metricValue === undefined) {
		return mapColors.base
	}
	if (flattened) {
		return mapColors.flat
	}

	const { colorRange, colorMode } = dynamicSettings

	if (dynamicSettings["colorMetric"] === "unary") {
		return mapColors.positive
	}

	if (colorMode === ColorMode.absolute) {
		if (metricValue < colorRange.from || colorRange.from === nodeMetricDataRange.maxValue) {
			return mapColors.positive
		}
		if (metricValue < colorRange.to || colorRange.to === nodeMetricDataRange.maxValue) {
			return mapColors.neutral
		}
		return mapColors.negative
	}

	if (colorMode === ColorMode.trueGradient) {
		return gradientCalculator.getColorByTrueGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
	}

	if (colorMode === ColorMode.focusedGradient) {
		return gradientCalculator.getColorByFocusedGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
	}

	return gradientCalculator.getColorByWeightedGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
}

export const TreeMapHelper = {
	countNodes,
	buildingArrayToMap,
	buildRootFolderForFixedFolders,
	calculateSize,
	buildNodeFrom,
	isNodeFlat,
	resolveHeightValue,
	FOLDER_HEIGHT,
	MIN_BUILDING_HEIGHT,
	HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND
}
