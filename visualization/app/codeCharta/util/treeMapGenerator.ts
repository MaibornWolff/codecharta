import { LayoutNode, TreeMapHelper } from "./treeMapHelper"
import { hierarchy, treemap, HierarchyNode, HierarchyRectangularNode, TreemapLayout } from "d3"
import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, BlacklistType, MetricData, Node, State } from "../codeCharta.model"
import Rectangle from "./algorithm/rectangle"
import Point from "./algorithm/point"

export interface SquarifiedCodeMapNode extends HierarchyRectangularNode<CodeMapNode> {}

export class TreeMapGenerator {
	private static PADDING_SCALING_FACTOR = 0.4

	public static createTreemapNodes(map: CodeMapNode, s: State, metricData: MetricData[]): Node[] {
		const isDeltaState = s.files.isDeltaState()
		const squarifiedTreeMap: SquarifiedCodeMapNode = this.getSquarifiedTreeMap(map, s)
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = (s.treeMap.mapSize * 2) / maxHeight
		const nodesAsArray: SquarifiedCodeMapNode[] = this.getNodesAsArray(squarifiedTreeMap)
		return nodesAsArray.map(squarifiedNode => {
			const layoutNode: LayoutNode = this.convertToLayoutNode(squarifiedNode)
			return TreeMapHelper.buildNodeFrom(layoutNode, heightScale, maxHeight, s, isDeltaState)
		})
	}

	private static getSquarifiedTreeMap(map: CodeMapNode, s: State): SquarifiedCodeMapNode {
		const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
		const nodeLeafs: CodeMapNode[] = hierarchyNode.descendants().map(d => d.data)
		const blacklisted: number = CodeMapHelper.numberOfBlacklistedNodes(nodeLeafs, s.fileSettings.blacklist)
		const nodesPerSide: number = 2 * Math.sqrt(hierarchyNode.descendants().length - blacklisted)
		const mapLength: number = s.treeMap.mapSize * 2 + nodesPerSide * s.dynamicSettings.margin
		const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
		let treeMap: TreemapLayout<CodeMapNode> = treemap<CodeMapNode>()
			.size([mapLength, mapLength])
			.paddingOuter(padding)
			.paddingInner(padding)

		return treeMap(hierarchyNode.sum(node => this.calculateAreaValue(node, s)))
	}

	private static convertToLayoutNode(squarifiedNode: SquarifiedCodeMapNode): LayoutNode {
		const depth: number = squarifiedNode.data.path.split("/").length - 2
		const length = squarifiedNode.y1 - squarifiedNode.y0
		const width = squarifiedNode.x1 - squarifiedNode.x0
		return {
			data: squarifiedNode.data,
			value: squarifiedNode.value,
			rect: new Rectangle(new Point(squarifiedNode.x0, squarifiedNode.y0), width, length),
			zOffset: depth
		}
	}

	private static getNodesAsArray(node: SquarifiedCodeMapNode): SquarifiedCodeMapNode[] {
		let nodes = [node]
		if (node.children) {
			node.children.forEach(child => nodes.push(...this.getNodesAsArray(child)))
		}
		return nodes
	}

	public static setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean): CodeMapNode {
		node.visible = visibility
		hierarchy<CodeMapNode>(node)
			.descendants()
			.forEach(hierarchyNode => (hierarchyNode.data.visible = visibility))
		return node
	}

	private static isOnlyVisibleInComparisonMap(node: CodeMapNode, s: State): boolean {
		return node && node.deltas && node.deltas[s.dynamicSettings.heightMetric] < 0 && node.attributes[s.dynamicSettings.areaMetric] === 0
	}

	private static calculateAreaValue(node: CodeMapNode, s: State): number {
		if (CodeMapHelper.isBlacklisted(node, s.fileSettings.blacklist, BlacklistType.exclude)) {
			return 0
		}

		if (this.isOnlyVisibleInComparisonMap(node, s)) {
			return Math.abs(node.deltas[s.dynamicSettings.areaMetric])
		}

		if (this.isNodeLeaf(node) && node.attributes && node.attributes[s.dynamicSettings.areaMetric]) {
			return node.attributes[s.dynamicSettings.areaMetric]
		}
		return 0
	}

	private static isNodeLeaf(node: CodeMapNode) {
		return !node.children || node.children.length === 0
	}
}
