import { SquarifiedValuedCodeMapNode } from "./treeMapGenerator"
import { CodeMapHelper } from "./codeMapHelper"
import { Settings, Node } from "../codeCharta.model"

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

		return {
			name: squaredNode.data.name,
			width: squaredNode.x1 - squaredNode.x0,
			height: Math.abs(
				isNodeLeaf ? Math.max(heightScale * heightValue, TreeMapHelper.MIN_BUILDING_HEIGHT) : TreeMapHelper.FOLDER_HEIGHT
			),
			length: squaredNode.y1 - squaredNode.y0,
			depth: depth,
			x0: squaredNode.x0,
			z0: depth * TreeMapHelper.FOLDER_HEIGHT,
			y0: squaredNode.y0,
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
			flat: flattened
		}
	}

	private static isNodeToBeFlat(squaredNode: SquarifiedValuedCodeMapNode, s: Settings): boolean {
		let flattened = false
		if (s.fileSettings.edges && s.fileSettings.edges.filter(edge => edge.visible).length > 0) {
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
