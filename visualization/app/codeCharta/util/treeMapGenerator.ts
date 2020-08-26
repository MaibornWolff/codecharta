import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap, TreemapLayout } from "d3"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapNode, MetricData, Node, State } from "../codeCharta.model"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

export class TreeMapGenerator {
	private static PADDING_SCALING_FACTOR = 0.4

	public static createTreemapNodes(map: CodeMapNode, s: State, metricData: MetricData[], isDeltaState: boolean): Node[] {
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = (s.treeMap.mapSize * 2) / maxHeight

		if (this.hasFixedFolders(map)) {
			const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
			const nodes = this.buildSquarifiedTreeMapsForFixedFolders(hierarchyNode.data, s, heightScale, maxHeight, isDeltaState)
			nodes.unshift(TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, s, isDeltaState))

			// scale nodes based on mapSize and margin
			const scale = (s.treeMap.mapSize * 2 + this.getNodesPerSide(hierarchyNode) * s.dynamicSettings.margin) / nodes[0].length
			nodes.forEach(node => {
				node.x0 *= scale
				node.y0 *= scale
				node.width *= scale
				node.length *= scale
			})

			return nodes
		} else {
			const squarifiedTreeMap = this.getSquarifiedTreeMap(map, s)
			return squarifiedTreeMap.treeMap
				.descendants()
				.map(squarifiedNode => TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, s, isDeltaState))
		}
	}

	private static hasFixedFolders(map: CodeMapNode): boolean {
		return !!map.children[0]?.fixed
	}

	private static buildSquarifiedTreeMapsForFixedFolders(
		map: CodeMapNode,
		state: State,
		heightScale: number,
		maxHeight: number,
		isDeltaState: boolean
	): Node[] {
		const nodes: Node[] = []

		for (const fixedFolder of map.children) {
			const squarified = this.getSquarifiedTreeMap(fixedFolder, state)

			// calculate scale to rescale the tree map coordinates to the fixed folder coordinates
			const scaleX = fixedFolder.fixed.width / squarified.width
			const scaleY = fixedFolder.fixed.height / squarified.height

			squarified.treeMap.descendants().forEach(squarifiedNode => {
				squarifiedNode.x0 = squarifiedNode.x0 * scaleX + fixedFolder.fixed.x
				squarifiedNode.x1 = squarifiedNode.x1 * scaleX + fixedFolder.fixed.x
				squarifiedNode.y0 = squarifiedNode.y0 * scaleY + fixedFolder.fixed.y
				squarifiedNode.y1 = squarifiedNode.y1 * scaleY + fixedFolder.fixed.y
				// TODO: Scale edge points as well, not working yet
				const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
				/*
                node.incomingEdgePoint.x = node.incomingEdgePoint.x * scaleX + fixedFolder.fixed.x
                node.incomingEdgePoint.z = node.incomingEdgePoint.z * scaleY + fixedFolder.fixed.y
                node.outgoingEdgePoint.x = node.outgoingEdgePoint.x * scaleX + fixedFolder.fixed.x
                node.outgoingEdgePoint.z = node.outgoingEdgePoint.z * scaleY + fixedFolder.fixed.y
                */
				nodes.push(node)
			})
		}
		return nodes
	}

	private static getSquarifiedTreeMap(map: CodeMapNode, s: State): SquarifiedTreeMap {
		const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
		const nodesPerSide = this.getNodesPerSide(hierarchyNode)
		const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
		let mapWidth
		let mapHeight

		if (map.fixed !== undefined) {
			mapWidth = map.fixed.width
			mapHeight = map.fixed.height
		} else {
			mapWidth = s.treeMap.mapSize * 2
			mapHeight = s.treeMap.mapSize * 2
		}

		const width = mapWidth + nodesPerSide * s.dynamicSettings.margin
		const height = mapHeight + nodesPerSide * s.dynamicSettings.margin

		const treeMap: TreemapLayout<CodeMapNode> = treemap<CodeMapNode>().size([width, height]).paddingOuter(padding).paddingInner(padding)

		return { treeMap: treeMap(hierarchyNode.sum(node => this.calculateAreaValue(node, s))), height, width }
	}

	private static getNodesPerSide(hierarchyNode: HierarchyNode<CodeMapNode>): number {
		const descendants = hierarchyNode.descendants()
		const blacklisted = descendants.filter(node => node.data.isExcluded || node.data.isFlattened).length
		return 2 * Math.sqrt(descendants.length - blacklisted)
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
