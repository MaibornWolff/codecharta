import { SquarifiedValuedCodeMapNode } from "./treeMapGenerator"
import { CodeMapHelper } from "./codeMapHelper"
import { Settings, Node } from "../codeCharta.model"
import { Vector3 } from "three"

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

	private static getHeightValue(s: Settings, squaredNode: SquarifiedValuedCodeMapNode, maxHeight: number, flattened: boolean): number {
		let heightValue = squaredNode.data.attributes[s.dynamicSettings.heightMetric] || TreeMapHelper.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND

		if (flattened) {
			return TreeMapHelper.MIN_BUILDING_HEIGHT
		} else if (s.appSettings.invertHeight) {
			return maxHeight - heightValue
		} else {
			return heightValue
		}
	}

	public static buildNodeFrom(squaredNode: SquarifiedValuedCodeMapNode, heightScale: number, maxHeight: number, s: Settings): Node {
		const isNodeLeaf: boolean = !(squaredNode.children && squaredNode.children.length > 0)
		const flattened: boolean = this.isNodeToBeFlat(squaredNode, s)
		const heightValue: number = this.getHeightValue(s, squaredNode, maxHeight, flattened)
		const depth: number = squaredNode.data.path.split("/").length - 2
		const width = squaredNode.x1 - squaredNode.x0
		const height = Math.abs(
			isNodeLeaf ? Math.max(heightScale * heightValue, TreeMapHelper.MIN_BUILDING_HEIGHT) : TreeMapHelper.FOLDER_HEIGHT
		)
		const length = squaredNode.y1 - squaredNode.y0
		const x0 = squaredNode.x0
		const y0 = squaredNode.y0
		const z0 = depth * TreeMapHelper.FOLDER_HEIGHT

		return {
			name: squaredNode.data.name,
			width,
			height,
			length,
			depth,
			x0,
			z0,
			y0,
			isLeaf: isNodeLeaf,
			attributes: squaredNode.data.attributes,
			deltas: squaredNode.data.deltas,
			heightDelta:
				squaredNode.data.deltas && squaredNode.data.deltas[s.dynamicSettings.heightMetric]
					? heightScale * squaredNode.data.deltas[s.dynamicSettings.heightMetric]
					: 0,
			visible: squaredNode.data.visible && !(isNodeLeaf && s.appSettings.hideFlatBuildings && flattened),
			path: squaredNode.data.path,
			origin: squaredNode.data.origin,
			link: squaredNode.data.link,
			markingColor: CodeMapHelper.getMarkingColor(squaredNode.data, s.fileSettings.markedPackages),
			flat: flattened,
			incomingEdgePoint: this.getIncomingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMapSettings.mapSize),
			outgoingEdgePoint: this.getOutgoingEdgePoint(width, height, length, new Vector3(x0, z0, y0), s.treeMapSettings.mapSize)
		}
	}

	private static getIncomingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
		if (width > length) {
			return new Vector3(vector.x - mapSize * 0.5 + width / 4, vector.y + height, vector.z - mapSize * 0.5 + length / 2)
		} else {
			return new Vector3(vector.x - mapSize * 0.5 + width / 2, vector.y + height, vector.z - mapSize * 0.5 + length / 4)
		}
	}

	private static getOutgoingEdgePoint(width: number, height: number, length: number, vector: Vector3, mapSize: number) {
		if (width > length) {
			return new Vector3(vector.x - mapSize * 0.5 + 0.75 * width, vector.y + height, vector.z - mapSize * 0.5 + length / 2)
		} else {
			return new Vector3(vector.x - mapSize * 0.5 + width / 2, vector.y + height, vector.z - mapSize * 0.5 + 0.75 * length)
		}
	}

	private static isNodeToBeFlat(squaredNode: SquarifiedValuedCodeMapNode, s: Settings): boolean {
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
		return flattened
	}

	private static nodeHasNoVisibleEdges(squaredNode: SquarifiedValuedCodeMapNode, s: Settings): boolean {
		return (
			s.fileSettings.edges.filter(
				edge => edge.visible && (squaredNode.data.path === edge.fromNodeName || squaredNode.data.path === edge.toNodeName)
			).length == 0
		)
	}

	private static isNodeNonSearched(squaredNode: SquarifiedValuedCodeMapNode, s: Settings): boolean {
		return s.dynamicSettings.searchedNodePaths.filter(path => path == squaredNode.data.path).length == 0
	}
}
