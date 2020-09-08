import { CodeMapHelper } from "./codeMapHelper"
import { Node, CodeMapNode, State } from "../codeCharta.model"
import { Vector3 } from "three"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { HierarchyRectangularNode } from "d3"

const FOLDER_HEIGHT = 2
const MIN_BUILDING_HEIGHT = 2
const HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0

function countNodes(node: { children?: any }): number {
	let count = 1
	if (node.children && node.children.length > 0) {
		for (let i = 0; i < node.children.length; i++) {
			count += countNodes(node.children[i])
		}
	}
	return count
}

function buildingArrayToMap(highlighted: CodeMapBuilding[]): Map<number, CodeMapBuilding> {
	const geomMap = new Map()
	highlighted.forEach(building => {
		geomMap.set(building.id, building)
	})

	return geomMap
}

function buildRootFolderForFixedFolders(map: CodeMapNode, heightScale: number, state: State, isDeltaState: boolean): Node {
	const flattened: boolean = isNodeToBeFlat(map, state)
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
		heightDelta: map.deltas?.[state.dynamicSettings.heightMetric] ? heightScale * map.deltas[state.dynamicSettings.heightMetric] : 0,
		visible: isVisible(map, false, state, flattened),
		path: map.path,
		link: map.link,
		markingColor: CodeMapHelper.getMarkingColor(map, state.fileSettings.markedPackages),
		flat: false,
		color: getBuildingColor(map, state, isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, height, length, new Vector3(0, 0, 0), state.treeMap.mapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, height, length, new Vector3(0, 0, 0), state.treeMap.mapSize)
	}
}

function buildNodeFrom(
	squaredNode: HierarchyRectangularNode<CodeMapNode>,
	heightScale: number,
	maxHeight: number,
	s: State,
	isDeltaState: boolean
): Node {
	const isNodeLeaf = !(squaredNode.children && squaredNode.children.length > 0)
	const flattened: boolean = isNodeToBeFlat(squaredNode.data, s)
	const heightValue: number = getHeightValue(s, squaredNode, maxHeight, flattened)
	const depth: number = squaredNode.data.path.split("/").length - 2
	const width = squaredNode.x1 - squaredNode.x0
	const height = Math.abs(isNodeLeaf ? Math.max(heightScale * heightValue, MIN_BUILDING_HEIGHT) : FOLDER_HEIGHT)
	const length = squaredNode.y1 - squaredNode.y0
	const x0 = squaredNode.x0
	const y0 = squaredNode.y0
	const z0 = depth * FOLDER_HEIGHT

	return {
		name: squaredNode.data.name,
		id: squaredNode.data.id,
		width,
		height,
		length,
		depth,
		x0,
		z0,
		y0,
		isLeaf: isNodeLeaf,
		attributes: squaredNode.data.attributes,
		edgeAttributes: squaredNode.data.edgeAttributes,
		deltas: squaredNode.data.deltas,
		heightDelta: squaredNode.data.deltas?.[s.dynamicSettings.heightMetric]
			? heightScale * squaredNode.data.deltas[s.dynamicSettings.heightMetric]
			: 0,
		visible: isVisible(squaredNode.data, isNodeLeaf, s, flattened),
		path: squaredNode.data.path,
		link: squaredNode.data.link,
		markingColor: CodeMapHelper.getMarkingColor(squaredNode.data, s.fileSettings.markedPackages),
		flat: flattened,
		color: getBuildingColor(squaredNode.data, s, isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize),
		outgoingEdgePoint: getOutgoingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize)
	}
}

function getHeightValue(s: State, squaredNode: HierarchyRectangularNode<CodeMapNode>, maxHeight: number, flattened: boolean): number {
	const heightValue = squaredNode.data.attributes[s.dynamicSettings.heightMetric] || HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND

	if (flattened) {
		return MIN_BUILDING_HEIGHT
	} else if (s.appSettings.invertHeight) {
		return maxHeight - heightValue
	}
	return heightValue
}

function isVisible(squaredNode: CodeMapNode, isNodeLeaf: boolean, s: State, flattened: boolean): boolean {
	let isVisible = true
	if (s.dynamicSettings.focusedNodePath.length > 0) {
		isVisible = squaredNode.path.includes(s.dynamicSettings.focusedNodePath)
	}
	if (squaredNode.isExcluded || (isNodeLeaf && s.appSettings.hideFlatBuildings && flattened)) {
		isVisible = false
	}
	return isVisible
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

function isNodeToBeFlat(codeMapNode: CodeMapNode, s: State): boolean {
	let flattened = false
	if (s.appSettings.showOnlyBuildingsWithEdges && s.fileSettings.edges?.filter(edge => edge.visible).length > 0) {
		flattened = nodeHasNoVisibleEdges(codeMapNode, s)
	}

	if (s.dynamicSettings.searchedNodePaths && s.dynamicSettings.searchPattern && s.dynamicSettings.searchPattern.length > 0) {
		flattened = s.dynamicSettings.searchedNodePaths.size == 0 ? true : isNodeNonSearched(codeMapNode, s)
	}

	flattened = codeMapNode.isFlattened || flattened
	return flattened
}

function nodeHasNoVisibleEdges(codeMapNode: CodeMapNode, s: State): boolean {
	return (
		codeMapNode.edgeAttributes[s.dynamicSettings.edgeMetric] === undefined ||
		s.fileSettings.edges.filter(edge => codeMapNode.path === edge.fromNodeName || codeMapNode.path === edge.toNodeName).length == 0
	)
}

function isNodeNonSearched(squaredNode: CodeMapNode, s: State): boolean {
	return !s.dynamicSettings.searchedNodePaths.has(squaredNode.path)
}

function getBuildingColor(node: CodeMapNode, s: State, isDeltaState: boolean, flattened: boolean): string {
	const mapColorPositive = s.appSettings.whiteColorBuildings ? s.appSettings.mapColors.lightGrey : s.appSettings.mapColors.positive
	if (isDeltaState) {
		return s.appSettings.mapColors.base
	}
	const metricValue: number = node.attributes[s.dynamicSettings.colorMetric]

	if (metricValue == null) {
		return s.appSettings.mapColors.base
	} else if (flattened) {
		return s.appSettings.mapColors.flat
	} else if (metricValue < s.dynamicSettings.colorRange.from) {
		return s.appSettings.invertColorRange ? s.appSettings.mapColors.negative : mapColorPositive
	} else if (metricValue > s.dynamicSettings.colorRange.to) {
		return s.appSettings.invertColorRange ? mapColorPositive : s.appSettings.mapColors.negative
	}
	return s.appSettings.mapColors.neutral
}

export const TreeMapHelper = {
	countNodes,
	buildingArrayToMap,
	buildRootFolderForFixedFolders,
	buildNodeFrom
}
