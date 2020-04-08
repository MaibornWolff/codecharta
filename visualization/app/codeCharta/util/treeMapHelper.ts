import { CodeMapHelper } from "./codeMapHelper"
import { Node, CodeMapNode, BlacklistItem, BlacklistType, State } from "../codeCharta.model"
import { Vector3 } from "three"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import Rectangle from "./algorithm/rectangle"

export interface LayoutNode {
	data: CodeMapNode
	value: number
	rect: Rectangle
	zOffset: number
}

export class TreeMapHelper {
	private static FOLDER_HEIGHT = 2
	private static MIN_BUILDING_HEIGHT = 2
	private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0

	public static countNodes(node: { children?: any }): number {
		let count = 1
		if (node.children && node.children.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				count += this.countNodes(node.children[i])
			}
		}
		return count
	}

	public static buildingArrayToMap(highlighted: CodeMapBuilding[]): Map<number, CodeMapBuilding> {
		const geomMap = new Map()
		highlighted.forEach(building => {
			geomMap.set(building.id, building)
		})

		return geomMap
	}

	private static getHeightValue(s: State, squaredNode: LayoutNode, maxHeight: number, flattened: boolean): number {
		let heightValue = squaredNode.data.attributes[s.dynamicSettings.heightMetric] || TreeMapHelper.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND

		if (flattened) {
			return TreeMapHelper.MIN_BUILDING_HEIGHT
		} else if (s.appSettings.invertHeight) {
			return maxHeight - heightValue
		} else {
			return heightValue
		}
	}

	public static buildNodeFrom(layoutNode: LayoutNode, heightScale: number, maxHeight: number, s: State, isDeltaState: boolean): Node {
		const isNodeLeaf: boolean = !(layoutNode.data.children && layoutNode.data.children.length > 0)
		const flattened: boolean = this.isNodeToBeFlat(layoutNode, s)
		const heightValue: number = this.getHeightValue(s, layoutNode, maxHeight, flattened)
		const height = Math.abs(
			isNodeLeaf ? Math.max(heightScale * heightValue, TreeMapHelper.MIN_BUILDING_HEIGHT) : TreeMapHelper.FOLDER_HEIGHT
		)

		const length = layoutNode.rect.height
		const x0 = layoutNode.rect.topLeft.x
		const y0 = layoutNode.rect.topLeft.y
		const z0 = layoutNode.zOffset * TreeMapHelper.FOLDER_HEIGHT

		return {
			name: layoutNode.data.name,
			width: layoutNode.rect.width,
			height,
			length,
			depth: layoutNode.zOffset,
			x0,
			z0,
			y0,
			isLeaf: isNodeLeaf,
			attributes: layoutNode.data.attributes,
			edgeAttributes: layoutNode.data.edgeAttributes,
			deltas: layoutNode.data.deltas,
			heightDelta:
				layoutNode.data.deltas && layoutNode.data.deltas[s.dynamicSettings.heightMetric]
					? heightScale * layoutNode.data.deltas[s.dynamicSettings.heightMetric]
					: 0,
			visible: layoutNode.data.visible && !(isNodeLeaf && s.appSettings.hideFlatBuildings && flattened),
			path: layoutNode.data.path,
			link: layoutNode.data.link,
			markingColor: CodeMapHelper.getMarkingColor(layoutNode.data, s.fileSettings.markedPackages),
			flat: flattened,
			color: this.getBuildingColor(layoutNode.data, s, isDeltaState, flattened),
			incomingEdgePoint: this.getIncomingEdgePoint(layoutNode.rect.width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize),
			outgoingEdgePoint: this.getOutgoingEdgePoint(layoutNode.rect.width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize)
		}
	}

	private static getIncomingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
		if (width > length) {
			return new Vector3(vector.x - mapSize + width / 4, vector.y + height, vector.z - mapSize + length / 2)
		} else {
			return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + length / 4)
		}
	}

	private static getOutgoingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
		if (width > length) {
			return new Vector3(vector.x - mapSize + 0.75 * width, vector.y + height, vector.z - mapSize + length / 2)
		} else {
			return new Vector3(vector.x - mapSize + width / 2, vector.y + height, vector.z - mapSize + 0.75 * length)
		}
	}

	private static isNodeToBeFlat(squaredNode: LayoutNode, s: State): boolean {
		let flattened = false
		if (
			s.appSettings.showOnlyBuildingsWithEdges &&
			s.fileSettings.edges &&
			s.fileSettings.edges.filter(edge => edge.visible).length > 0
		) {
			flattened = this.nodeHasNoVisibleEdges(squaredNode, s)
		}

		if (s.dynamicSettings.searchedNodePaths && s.dynamicSettings.searchPattern && s.dynamicSettings.searchPattern.length > 0) {
			flattened = s.dynamicSettings.searchedNodePaths.length == 0 ? true : this.isNodeNonSearched(squaredNode, s)
		}

		let blacklistFlattened = this.isNodeOrParentFlattenedInBlacklist(squaredNode, s.fileSettings.blacklist)

		flattened = blacklistFlattened || flattened
		return flattened
	}

	private static nodeHasNoVisibleEdges(squaredNode: LayoutNode, s: State): boolean {
		return (
			squaredNode.data.edgeAttributes[s.dynamicSettings.edgeMetric] === undefined ||
			s.fileSettings.edges.filter(edge => squaredNode.data.path === edge.fromNodeName || squaredNode.data.path === edge.toNodeName)
				.length == 0
		)
	}

	private static isNodeNonSearched(squaredNode: LayoutNode, s: State): boolean {
		return s.dynamicSettings.searchedNodePaths.filter(path => path == squaredNode.data.path).length == 0
	}

	private static isNodeOrParentFlattenedInBlacklist(squaredNode: LayoutNode, blacklist: BlacklistItem[]): boolean {
		return CodeMapHelper.isBlacklisted(squaredNode.data, blacklist, BlacklistType.flatten)
	}

	private static getBuildingColor(node: CodeMapNode, s: State, isDeltaState: boolean, flattened: boolean): string {
		let mapColorPositive = s.appSettings.whiteColorBuildings ? s.appSettings.mapColors.lightGrey : s.appSettings.mapColors.positive
		if (isDeltaState) {
			return s.appSettings.mapColors.base
		} else {
			const metricValue: number = node.attributes[s.dynamicSettings.colorMetric]

			if (metricValue == null) {
				return s.appSettings.mapColors.base
			} else if (flattened) {
				return s.appSettings.mapColors.flat
			} else if (metricValue < s.dynamicSettings.colorRange.from) {
				return s.appSettings.invertColorRange ? s.appSettings.mapColors.negative : mapColorPositive
			} else if (metricValue > s.dynamicSettings.colorRange.to) {
				return s.appSettings.invertColorRange ? mapColorPositive : s.appSettings.mapColors.negative
			} else {
				return s.appSettings.mapColors.neutral
			}
		}
	}
}
