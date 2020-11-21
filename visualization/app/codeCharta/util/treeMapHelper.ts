import { getMarkingColor, isLeaf } from "./codeMapHelper"
import { Node, CodeMapNode, State } from "../codeCharta.model"
import { Vector3 } from "three"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { HierarchyRectangularNode } from "d3-hierarchy"

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

function buildingArrayToMap(highlighted: CodeMapBuilding[]) {
	const geomMap: Map<number, CodeMapBuilding> = new Map()

	for (const building of highlighted) {
		geomMap.set(building.id, building)
	}

	return geomMap
}

function buildRootFolderForFixedFolders(map: CodeMapNode, heightScale: number, state: State, isDeltaState: boolean) {
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
		color: getBuildingColor(map, state, isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, height, length, new Vector3(0, 0, 0), state.treeMap.mapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, height, length, new Vector3(0, 0, 0), state.treeMap.mapSize)
	} as Node
}

function buildNodeFrom(
	squaredNode: HierarchyRectangularNode<CodeMapNode>,
	heightScale: number,
	maxHeight: number,
	state: State,
	isDeltaState: boolean
): Node {
	const { x0, x1, y0, y1, data } = squaredNode
	const isNodeLeaf = isLeaf(squaredNode)
	const flattened = isNodeFlat(data, state)
	const heightValue = getHeightValue(state, squaredNode, maxHeight, flattened)
	const depth = data.path.split("/").length - 2
	const height = Math.abs(isNodeLeaf ? Math.max(heightScale * heightValue, MIN_BUILDING_HEIGHT) : FOLDER_HEIGHT)
	const width = x1 - x0
	const length = y1 - y0
	const z0 = depth * FOLDER_HEIGHT

	return {
		name: data.name,
		id: data.id,
		width,
		height,
		length,
		depth,
		x0,
		z0,
		y0,
		isLeaf: isNodeLeaf,
		attributes: data.attributes,
		edgeAttributes: data.edgeAttributes,
		deltas: data.deltas,
		heightDelta: (data.deltas?.[state.dynamicSettings.heightMetric] ?? 0) * heightScale,
		visible: isVisible(data, isNodeLeaf, state, flattened),
		path: data.path,
		link: data.link,
		markingColor: getMarkingColor(data, state.fileSettings.markedPackages),
		flat: flattened,
		color: getBuildingColor(data, state, isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, height, length, new Vector3(x0, z0, y0), state.treeMap.mapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, height, length, new Vector3(x0, z0, y0), state.treeMap.mapSize)
	}
}

function getHeightValue(state: State, squaredNode: HierarchyRectangularNode<CodeMapNode>, maxHeight: number, flattened: boolean) {
	if (flattened) {
		return MIN_BUILDING_HEIGHT
	}

	const heightValue = squaredNode.data.attributes[state.dynamicSettings.heightMetric] || HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND

	if (state.appSettings.invertHeight) {
		return maxHeight - heightValue
	}
	return heightValue
}

function isVisible(squaredNode: CodeMapNode, isNodeLeaf: boolean, state: State, flattened: boolean) {
	if (squaredNode.isExcluded || (isNodeLeaf && state.appSettings.hideFlatBuildings && flattened)) {
		return false
	}

	if (state.dynamicSettings.focusedNodePath.length > 0) {
		return squaredNode.path.startsWith(state.dynamicSettings.focusedNodePath)
	}

	return true
}

function getIncomingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
	if (width > length) {
		return new Vector3(vector.x - mapSize + width / 4, vector.y + height, vector.z - mapSize + length / 2)
	}
	return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + length / 4)
}

function getOutgoingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
	if (width > length) {
		return new Vector3(vector.x - mapSize + 0.75 * width, vector.y + height, vector.z - mapSize + length / 2)
	}
	return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + 0.75 * length)
}

function isNodeFlat(codeMapNode: CodeMapNode, state: State) {
	if (codeMapNode.isFlattened) {
		return true
	}

	if (state.dynamicSettings.searchedNodePaths && state.dynamicSettings.searchPattern?.length > 0) {
		return state.dynamicSettings.searchedNodePaths.size === 0 || isNodeNonSearched(codeMapNode, state)
	}

	if (state.appSettings.showOnlyBuildingsWithEdges && state.fileSettings.edges.find(edge => edge.visible)) {
		return nodeHasNoVisibleEdges(codeMapNode, state)
	}

	return false
}

function nodeHasNoVisibleEdges(codeMapNode: CodeMapNode, state: State) {
	return (
		codeMapNode.edgeAttributes[state.dynamicSettings.edgeMetric] === undefined ||
		!state.fileSettings.edges.find(edge => codeMapNode.path === edge.fromNodeName || codeMapNode.path === edge.toNodeName)
	)
}

function isNodeNonSearched(squaredNode: CodeMapNode, state: State) {
	return !state.dynamicSettings.searchedNodePaths.has(squaredNode.path)
}

function getBuildingColor(node: CodeMapNode, { appSettings, dynamicSettings }: State, isDeltaState: boolean, flattened: boolean) {
	const { mapColors, invertColorRange, whiteColorBuildings } = appSettings

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
	const mapColorPositive = whiteColorBuildings ? mapColors.lightGrey : mapColors.positive
	if (metricValue < dynamicSettings.colorRange.from) {
		return invertColorRange ? mapColors.negative : mapColorPositive
	}
	if (metricValue > dynamicSettings.colorRange.to) {
		return invertColorRange ? mapColorPositive : mapColors.negative
	}
	return mapColors.neutral
}

export const TreeMapHelper = {
	countNodes,
	buildingArrayToMap,
	buildRootFolderForFixedFolders,
	buildNodeFrom
}
