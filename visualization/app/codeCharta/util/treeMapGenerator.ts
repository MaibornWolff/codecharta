import * as d3 from "d3"
import { hierarchy, HierarchyNode } from "d3"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapHelper } from "./codeMapHelper"
import { CodeMapNode, BlacklistType, CCFile, Settings, MetricData, Node } from "../codeCharta.model"

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

	public static createTreemapNodes(renderFile: CCFile, s: Settings, metricData: MetricData[]): Node {
		const squaredNode: SquarifiedValuedCodeMapNode = this.squarify(renderFile, s)
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = s.treeMapSettings.mapSize / TreeMapGenerator.HEIGHT_DIVISOR / maxHeight
		return this.addHeightDimensionAndFinalize(squaredNode, s, maxHeight, heightScale)
	}

	private static squarify(renderFile: CCFile, s: Settings): SquarifiedValuedCodeMapNode {
		let map: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(renderFile.map)
		const blacklisted = CodeMapHelper.numberOfBlacklistedNodes(map.descendants().map(d => d.data), s.fileSettings.blacklist)
		const nodesPerSide = 2 * Math.sqrt(map.descendants().length - blacklisted)
		let treeMap = d3
			.treemap<CodeMapNode>()
			.size([
				s.treeMapSettings.mapSize + nodesPerSide * s.dynamicSettings.margin,
				s.treeMapSettings.mapSize + nodesPerSide * s.dynamicSettings.margin
			])
			.paddingOuter(s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR || 1)
			.paddingInner(s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR || 1)

		return treeMap(map.sum(node => this.calculateValue(node, s))) as SquarifiedValuedCodeMapNode
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
