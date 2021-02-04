import { Vector3 } from "three"
import { CodeMapNode, Node, State } from "../../../codeCharta.model"
import { getMarkingColor, isLeaf } from "../../codeMapHelper"
import { getBuildingColor, getIncomingEdgePoint, isNodeFlat, isVisible, TreeMapHelper } from "../treeMapLayout/treeMapHelper"

function calculateSize(node: CodeMapNode, metricName: string) {
	// TODO if it is same as countNodes in treeMapHelper.ts
	// TODO from Ruben: This function is frequently used (even during sorting).
	//  As such, it's best to use memoization to reduce the computational overhead.
	//  That way there's no need to change the calling places of this function and it's still fast.
	let totalSize = node.attributes[metricName] || 0

	if (totalSize === 0 && node.children && node.children.length > 0) {
		for (const child of node.children) {
			totalSize += calculateSize(child, metricName)
		}
	}
	return totalSize
}

function mergeDirectories(node: CodeMapNode, metricName: string): CodeMapNode {
	let mergedNode = node
	const nodeSize = calculateSize(node, metricName)
	for (const child of node.children) {
		if (!isLeaf(child)) {
			const childSize = calculateSize(child, metricName)
			if (nodeSize === childSize) {
				const nodeName = mergedNode.name
				mergedNode = child
				mergedNode.name = `${nodeName}/${child.name}`
				break
			}
		}
	}
	return mergedNode
}

function getHeightValue(s: State, squaredNode: CodeMapNode, maxHeight: number, flattened: boolean): number {
	const heightValue = squaredNode.attributes[s.dynamicSettings.heightMetric] || TreeMapHelper.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND

	if (flattened) {
		return TreeMapHelper.MIN_BUILDING_HEIGHT
	}
	if (s.appSettings.invertHeight) {
		return maxHeight - heightValue
	}
	return heightValue
}

function buildNodeFrom(layoutNode: CodeMapNode, heightScale: number, maxHeight: number, s: State, isDeltaState: boolean): Node {
	const isNodeLeaf = !(layoutNode.children && layoutNode.children.length > 0)
	const flattened: boolean = isNodeFlat(layoutNode, s)
	const heightValue: number = getHeightValue(s, layoutNode, maxHeight, flattened)
	const height = Math.abs(
		isNodeLeaf ? Math.max(heightScale * heightValue, TreeMapHelper.MIN_BUILDING_HEIGHT) : TreeMapHelper.FOLDER_HEIGHT
	)

	const length = layoutNode.rect.height
	const x0 = layoutNode.rect.topLeft.x
	const y0 = layoutNode.rect.topLeft.y
	const z0 = layoutNode.zOffset * TreeMapHelper.FOLDER_HEIGHT

	return {
		name: layoutNode.name,
		id: layoutNode.id,
		width: layoutNode.rect.width,
		height,
		length,
		depth: layoutNode.zOffset,
		mapNodeDepth: 100,
		x0,
		z0,
		y0,
		isLeaf: isNodeLeaf,
		attributes: layoutNode.attributes,
		edgeAttributes: layoutNode.edgeAttributes,
		deltas: layoutNode.deltas,
		heightDelta: layoutNode.deltas?.[s.dynamicSettings.heightMetric]
			? heightScale * layoutNode.deltas[s.dynamicSettings.heightMetric]
			: 0,
		visible: isVisible(layoutNode, isNodeLeaf, s, flattened),
		path: layoutNode.path,
		link: layoutNode.link,
		markingColor: getMarkingColor(layoutNode, s.fileSettings.markedPackages),
		flat: flattened,
		color: getBuildingColor(layoutNode, s, isDeltaState, flattened),
		incomingEdgePoint: getIncomingEdgePoint(layoutNode.rect.width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize),
		outgoingEdgePoint: getIncomingEdgePoint(layoutNode.rect.width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize)
	}
}

export const StreetViewHelper = {
	calculateSize,
	mergeDirectories,
	buildNodeFrom
}
