import { SquarifiedValuedCodeMapNode } from "./treeMapGenerator"
import { CodeMapHelper } from "./codeMapHelper"
import { Settings, Node } from "../codeCharta.model"

export class TreeMapHelper {
	public static countNodes(node: { children?: any }): number {
		let count = 1
		if (node.children && node.children.length > 0) {
			for (let i = 0; i < node.children.length; i++) {
				count += this.countNodes(node.children[i])
			}
		}
		return count
	}

	public static isNodeLeaf(node: { children?: any }): boolean {
		return !(node.children && node.children.length > 0)
	}

	public static buildNodeFrom(
		squaredNode: SquarifiedValuedCodeMapNode,
		heightScale: number,
		heightValue: number,
		maxHeight: number,
		depth: number,
		parent: Node,
		s: Settings,
		minHeight: number,
		folderHeight: number
	): Node {
		let calculatedHeightValue = heightValue
		if (s.appSettings.invertHeight) {
			calculatedHeightValue = maxHeight - heightValue
		}

		const flattened = this.isNodeToBeFlat(squaredNode, s)
		if (flattened) {
			calculatedHeightValue = minHeight
		}

		return {
			name: squaredNode.data.name,
			width: squaredNode.x1 - squaredNode.x0,
			height: Math.abs(this.isNodeLeaf(squaredNode) ? Math.max(heightScale * calculatedHeightValue, minHeight) : folderHeight),
			length: squaredNode.y1 - squaredNode.y0,
			depth: depth,
			x0: squaredNode.x0,
			z0: depth * folderHeight,
			y0: squaredNode.y0,
			isLeaf: this.isNodeLeaf(squaredNode),
			attributes: squaredNode.data.attributes,
			deltas: squaredNode.data.deltas,
			parent: parent,
			heightDelta:
				squaredNode.data.deltas && squaredNode.data.deltas[s.dynamicSettings.heightMetric]
					? heightScale * squaredNode.data.deltas[s.dynamicSettings.heightMetric]
					: 0,
			visible: squaredNode.data.visible && !(this.isNodeLeaf(squaredNode) && s.appSettings.hideFlatBuildings && flattened),
			path: squaredNode.data.path,
			origin: squaredNode.data.origin,
			link: squaredNode.data.link,
			children: [],
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
