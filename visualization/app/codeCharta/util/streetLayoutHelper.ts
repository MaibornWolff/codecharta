import { CodeMapHelper } from "./codeMapHelper"
import { Node, CodeMapNode, State, BlacklistType, BlacklistItem } from "../codeCharta.model"
import { Vector3 } from "three"
import { CodeMapBuilding } from "../ui/codeMap/rendering/codeMapBuilding"
import { StreetLayoutValuedCodeMapNode } from "./streetLayoutGenerator"

export class StreetLayoutHelper {
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

	public static calculateSize(node: CodeMapNode, metricName: string) {
		let totalSize = 0

		if (node.children && node.children.length > 0) {
			for (const child of node.children) {
				totalSize += StreetLayoutHelper.calculateSize(child, metricName)
			}
			return totalSize
		} else {
			return node.attributes[metricName] || 0
		}
	}

	private static getHeightValue(
		s: State,
		streetLayoutNode: StreetLayoutValuedCodeMapNode,
		maxHeight: number,
		flattened: boolean
	): number {
		let heightValue =
			streetLayoutNode.data.attributes[s.dynamicSettings.heightMetric] || StreetLayoutHelper.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND
		if (flattened) {
			return StreetLayoutHelper.MIN_BUILDING_HEIGHT
		} else if (s.appSettings.invertHeight) {
			return maxHeight - heightValue
		} else {
			return heightValue
		}
	}

	public static createNode(
		streetLayoutNode: StreetLayoutValuedCodeMapNode,
		heightScale: number,
		maxHeight: number,
		s: State,
		isDeltaState: boolean
	): Node {
		const isNodeLeaf: boolean = !(streetLayoutNode.data.children && streetLayoutNode.data.children.length > 0)
		const flattened: boolean = this.isNodeToBeFlat(streetLayoutNode, s)
		const heightValue: number = this.getHeightValue(s, streetLayoutNode, maxHeight, flattened)
		const depth: number = streetLayoutNode.data.path.split("/").length - 2
		const width = streetLayoutNode.rect.width
		const height = Math.abs(
			isNodeLeaf ? Math.max(heightValue, StreetLayoutHelper.MIN_BUILDING_HEIGHT) : StreetLayoutHelper.FOLDER_HEIGHT
		)
		const length = streetLayoutNode.rect.height
		const x0 = streetLayoutNode.rect.topLeft.x
		const y0 = streetLayoutNode.rect.topLeft.y
		if (streetLayoutNode.zOffset < 0) {
			console.log("wut")
		}
		const z0 = streetLayoutNode.zOffset * StreetLayoutHelper.FOLDER_HEIGHT

		return {
			name: streetLayoutNode.data.name,
			width,
			height,
			length,
			depth,
			x0,
			y0,
			z0,
			isLeaf: isNodeLeaf,
			attributes: streetLayoutNode.data.attributes,
			edgeAttributes: streetLayoutNode.data.edgeAttributes,
			deltas: streetLayoutNode.data.deltas,
			heightDelta:
				streetLayoutNode.data.deltas && streetLayoutNode.data.deltas[s.dynamicSettings.heightMetric]
					? heightScale * streetLayoutNode.data.deltas[s.dynamicSettings.heightMetric]
					: 0,
			visible: streetLayoutNode.data.visible && !(isNodeLeaf && s.appSettings.hideFlatBuildings && flattened),
			path: streetLayoutNode.data.path,
			link: streetLayoutNode.data.link,
			markingColor: CodeMapHelper.getMarkingColor(streetLayoutNode.data, s.fileSettings.markedPackages),
			flat: flattened,
			color: this.getBuildingColor(streetLayoutNode.data, s, isDeltaState, flattened),
			incomingEdgePoint: this.getIncomingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize),
			outgoingEdgePoint: this.getOutgoingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMap.mapSize)
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

	private static isNodeToBeFlat(streetLayoutNode: StreetLayoutValuedCodeMapNode, s: State): boolean {
		let flattened = false
		if (
			s.appSettings.showOnlyBuildingsWithEdges &&
			s.fileSettings.edges &&
			s.fileSettings.edges.filter(edge => edge.visible).length > 0
		) {
			flattened = this.nodeHasNoVisibleEdges(streetLayoutNode, s)
		}

		if (s.dynamicSettings.searchedNodePaths && s.dynamicSettings.searchPattern && s.dynamicSettings.searchPattern.length > 0) {
			flattened = s.dynamicSettings.searchedNodePaths.length == 0 ? true : this.isNodeNonSearched(streetLayoutNode, s)
		}

		let blacklistFlattened = this.isNodeOrParentFlattenedInBlacklist(streetLayoutNode, s.fileSettings.blacklist)

		flattened = blacklistFlattened || flattened
		return flattened
	}

	private static nodeHasNoVisibleEdges(streetLayoutNode: StreetLayoutValuedCodeMapNode, s: State): boolean {
		return (
			streetLayoutNode.data.edgeAttributes[s.dynamicSettings.edgeMetric] === undefined ||
			s.fileSettings.edges.filter(
				edge => streetLayoutNode.data.path === edge.fromNodeName || streetLayoutNode.data.path === edge.toNodeName
			).length == 0
		)
	}

	private static isNodeNonSearched(streetLayoutNode: StreetLayoutValuedCodeMapNode, s: State): boolean {
		return s.dynamicSettings.searchedNodePaths.filter(path => path == streetLayoutNode.data.path).length == 0
	}

	private static isNodeOrParentFlattenedInBlacklist(
		streetLayoutNode: StreetLayoutValuedCodeMapNode,
		blacklist: BlacklistItem[]
	): boolean {
		return CodeMapHelper.isBlacklisted(streetLayoutNode.data, blacklist, BlacklistType.flatten)
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
