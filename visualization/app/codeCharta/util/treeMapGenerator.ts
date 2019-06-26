import * as d3 from "d3"
import { hierarchy, HierarchyNode, TreemapLayout } from "d3"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, BlacklistType, Settings, MetricData, Node } from "../codeCharta.model"
import Code = marked.Tokens.Code;

export interface SquarifiedValuedCodeMapNode {
	data: CodeMapNode
	children?: SquarifiedValuedCodeMapNode[]
	parent?: SquarifiedValuedCodeMapNode
	value: number
	x0: number
	y0: number
	x1: number
	y1: number
}

export class TreeMapGenerator {
	private static PADDING_SCALING_FACTOR = 0.4
	private static HEIGHT_DIVISOR = 1

	public static createTreemapNodes(map: CodeMapNode, s: Settings, metricData: MetricData[]): Node {
		const squaredNode: SquarifiedValuedCodeMapNode = this.getSquarifiedTreeMap(map, s)
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = s.treeMapSettings.mapSize / TreeMapGenerator.HEIGHT_DIVISOR / maxHeight
		return this.addHeightDimensionAndFinalize(squaredNode, s, maxHeight, heightScale)
	}

	private static getSquarifiedTreeMap(map: CodeMapNode, s: Settings): SquarifiedValuedCodeMapNode {
		let hierarchy: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(map)
		const nodeLeafs: CodeMapNode[] = hierarchy.descendants().map(d => d.data)
		const blacklisted: number = CodeMapHelper.numberOfBlacklistedNodes(nodeLeafs, s.fileSettings.blacklist)
		const nodesPerSide: number = 2 * Math.sqrt(hierarchy.descendants().length - blacklisted)
		const mapLength: number = s.treeMapSettings.mapSize + nodesPerSide * s.dynamicSettings.margin
		const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
		let treeMap: TreemapLayout<CodeMapNode> = d3
			.treemap<CodeMapNode>()
			.size([mapLength, mapLength])
			.paddingOuter(padding)
			.paddingInner(padding)

		return treeMap(hierarchy.sum(node => this.calculateValue(node, s))) as SquarifiedValuedCodeMapNode
	}

	private static addHeightDimensionAndFinalize(
		squaredNode: SquarifiedValuedCodeMapNode,
		s: Settings,
		maxHeight: number,
		heightScale: number,
		depth: number = 0,
		parent: Node = null
	): Node {
		if (CodeMapHelper.isBlacklisted(squaredNode.data, s.fileSettings.blacklist, BlacklistType.hide)) {
			squaredNode.data = this.setVisibilityOfNodeAndDescendants(squaredNode.data, false)
		}
		const finalNode = TreeMapHelper.buildNodeFrom(squaredNode, heightScale, maxHeight, depth, parent, s)

		if (squaredNode.children && squaredNode.children.length > 0) {
			const finalChildren: Node[] = []
			squaredNode.children.forEach(child => {
				finalChildren.push(this.addHeightDimensionAndFinalize(child, s, maxHeight, heightScale, depth + 1, finalNode))
			})
			finalNode.children = finalChildren
		}
		return finalNode
	}

	public static setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
		node.visible = visibility
		hierarchy<CodeMapNode>(node)
			.descendants()
			.forEach(hierarchyNode => (hierarchyNode.data.visible = visibility))
		return node
	}

	private static isOnlyVisibleInComparisonMap(node: CodeMapNode, s: Settings): boolean {
		return node && node.deltas && node.deltas[s.dynamicSettings.heightMetric] < 0 && node.attributes[s.dynamicSettings.areaMetric] === 0
	}

	private static calculateValue(node: CodeMapNode, s: Settings): number {
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
