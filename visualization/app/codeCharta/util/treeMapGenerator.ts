import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap, TreemapLayout } from "d3"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, MetricData, Node, State } from "../codeCharta.model"

export interface SquarifiedCodeMapNode extends HierarchyRectangularNode<CodeMapNode> {}

export class TreeMapGenerator {
	private static PADDING_SCALING_FACTOR = 0.4

	public static createTreemapNodes(map: CodeMapNode, s: State, metricData: MetricData[], isDeltaState: boolean): Node[] {
		const squarifiedTreeMap: SquarifiedCodeMapNode = this.getSquarifiedTreeMap(map, s)
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = (s.treeMap.mapSize * 2) / maxHeight
		const nodesAsArray: SquarifiedCodeMapNode[] = this.getNodesAsArray(squarifiedTreeMap)
		return nodesAsArray.map(squarifiedNode => {
			return TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, s, isDeltaState)
		})
	}

	private static getSquarifiedTreeMap(map: CodeMapNode, s: State): SquarifiedCodeMapNode {
		const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
		const nodeLeafs: CodeMapNode[] = hierarchyNode.descendants().map(d => d.data)
		const blacklisted: number = CodeMapHelper.numberOfBlacklistedNodes(nodeLeafs)
		const nodesPerSide: number = 2 * Math.sqrt(hierarchyNode.descendants().length - blacklisted)
		const mapLength: number = s.treeMap.mapSize * 2 + nodesPerSide * s.dynamicSettings.margin
		const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
		let treeMap: TreemapLayout<CodeMapNode> = treemap<CodeMapNode>()
			.size([mapLength, mapLength])
			.paddingOuter(padding)
			.paddingInner(padding)

		return treeMap(hierarchyNode.sum(node => this.calculateAreaValue(node, s)))
	}

	private static getNodesAsArray(node: SquarifiedCodeMapNode): SquarifiedCodeMapNode[] {
		let nodes = [node]
		if (node.children) {
			node.children.forEach(child => nodes.push(...this.getNodesAsArray(child)))
		}
		return nodes
	}

	private static isOnlyVisibleInComparisonMap(node: CodeMapNode, s: State): boolean {
		return node && node.deltas && node.deltas[s.dynamicSettings.heightMetric] < 0 && node.attributes[s.dynamicSettings.areaMetric] === 0
	}

	private static calculateAreaValue(node: CodeMapNode, s: State): number {
		if (node.isExcluded) {
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
