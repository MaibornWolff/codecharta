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
	private static HEIGHT_DIVISOR = 1
	private static FOLDER_HEIGHT = 2
	private static MIN_BUILDING_HEIGHT = 2
	private static HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND = 0
	private static PADDING_SCALING_FACTOR = 0.4

	public static createTreemapNodes(renderFile: CCFile, s: Settings, metricData: MetricData[]): Node {
		const squaredNode: SquarifiedValuedCodeMapNode = this.squarify(renderFile, s)
		return this.addMapScaledHeightDimensionAndFinalizeFromRoot(squaredNode, s, metricData)
	}

	public static setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
		node.visible = visibility
		hierarchy<CodeMapNode>(node)
			.descendants()
			.forEach(hierarchyNode => {
				hierarchyNode.data.visible = visibility
			})
		return node
	}

	private static squarify(renderFile: CCFile, s: Settings): SquarifiedValuedCodeMapNode {
		let map: HierarchyNode<CodeMapNode> = d3.hierarchy<CodeMapNode>(renderFile.map)
		const blacklisted = CodeMapHelper.numberOfBlacklistedNodes(map.descendants().map(d => d.data), s.fileSettings.blacklist)
		let nodesPerSide = 2 * Math.sqrt(map.descendants().length - blacklisted)
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

	private static addMapScaledHeightDimensionAndFinalizeFromRoot(
		squaredNode: SquarifiedValuedCodeMapNode,
		s: Settings,
		metricData: MetricData[]
	): Node {
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = s.treeMapSettings.mapSize / TreeMapGenerator.HEIGHT_DIVISOR / maxHeight
		return this.addHeightDimensionAndFinalize(squaredNode, s, heightScale, maxHeight)
	}

	private static addHeightDimensionAndFinalize(
		squaredNode: SquarifiedValuedCodeMapNode,
		s: Settings,
		heightScale: number,
		maxHeight: number,
		depth = 0,
		parent: Node = null
	): Node {
		let attr = squaredNode.data.attributes || {}
		let heightValue = attr[s.dynamicSettings.heightMetric]

		if (heightValue === undefined || heightValue === null) {
			heightValue = TreeMapGenerator.HEIGHT_VALUE_WHEN_METRIC_NOT_FOUND
		}

		if (CodeMapHelper.isBlacklisted(squaredNode.data, s.fileSettings.blacklist, BlacklistType.hide)) {
			squaredNode.data = this.setVisibilityOfNodeAndDescendants(squaredNode.data, false)
		}

		const finalNode = TreeMapHelper.buildNodeFrom(
			squaredNode,
			heightScale,
			heightValue,
			maxHeight,
			depth,
			parent,
			s,
			TreeMapGenerator.MIN_BUILDING_HEIGHT,
			TreeMapGenerator.FOLDER_HEIGHT
		)

		if (squaredNode.children && squaredNode.children.length > 0) {
			const finalChildren: Node[] = []
			for (let i = 0; i < squaredNode.children.length; i++) {
				finalChildren.push(
					this.addHeightDimensionAndFinalize(squaredNode.children[i], s, heightScale, maxHeight, depth + 1, finalNode)
				)
			}
			finalNode.children = finalChildren
		}
		return finalNode
	}

	private static isOnlyVisibleInComparisonMap(node: CodeMapNode, s: Settings): boolean {
		return node && node.deltas && node.deltas[s.dynamicSettings.heightMetric] < 0 && node.attributes[s.dynamicSettings.areaMetric] === 0
	}

	private static calculateValue(node: CodeMapNode, s: Settings): number {
		let result = 0

		if (CodeMapHelper.isBlacklisted(node, s.fileSettings.blacklist, BlacklistType.exclude)) {
			return 0
		}

		if (this.isOnlyVisibleInComparisonMap(node, s)) {
			return Math.abs(node.deltas[s.dynamicSettings.areaMetric])
		}

		if (!node.children || node.children.length === 0) {
			if (node.attributes && node.attributes[s.dynamicSettings.areaMetric]) {
				result = node.attributes[s.dynamicSettings.areaMetric] || 0
			} else {
				result = this.getEdgeValue(node, s)
			}
		}
		return result
	}

	private static getEdgeValue(node: CodeMapNode, s: Settings) {
		let filteredEdgeAttributes: number[] = []

		if (s.fileSettings.edges) {
			s.fileSettings.edges.forEach(edge => {
				if (edge.fromNodeName == node.path || edge.toNodeName == node.path) {
					filteredEdgeAttributes.push(edge.attributes[s.dynamicSettings.areaMetric])
				}
			})
		}

		if (filteredEdgeAttributes) {
			return filteredEdgeAttributes.sort().reverse()[0]
		}
		return 1
	}
}
