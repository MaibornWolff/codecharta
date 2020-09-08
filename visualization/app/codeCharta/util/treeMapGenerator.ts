import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap, TreemapLayout } from "d3"
import { TreeMapHelper } from "./treeMapHelper"
import { CodeMapNode, Node, NodeMetricData, State } from "../codeCharta.model"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

export class TreeMapGenerator {
	private static PADDING_SCALING_FACTOR = 0.4

	public static createTreemapNodes(map: CodeMapNode, s: State, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = (s.treeMap.mapSize * 2) / maxHeight

		if (this.hasFixedFolders(map)) {
			return this.buildSquarifiedTreeMapsForFixedFolders(map, s, heightScale, maxHeight, isDeltaState)
		}
		const squarifiedTreeMap = this.getSquarifiedTreeMap(map, s)
		return squarifiedTreeMap.treeMap
			.descendants()
			.map(squarifiedNode => TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, s, isDeltaState))
	}

	private static hasFixedFolders(map: CodeMapNode): boolean {
		return !!map.children[0]?.fixedPosition
	}

	private static buildSquarifiedTreeMapsForFixedFolders(
		map: CodeMapNode,
		state: State,
		heightScale: number,
		maxHeight: number,
		isDeltaState: boolean
	): Node[] {
		const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)

		const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(map, heightScale, state, isDeltaState)]
		const scale =
			(state.treeMap.mapSize * 2 + this.getEstimatedNodesPerSide(hierarchyNode) * state.dynamicSettings.margin) / nodes[0].length
		this.scaleRoot(nodes[0], scale)

		for (const fixedFolder of map.children) {
			const squarified = this.getSquarifiedTreeMap(fixedFolder, state)
			squarified.treeMap.descendants().forEach(squarifiedNode => {
				this.scaleAndTranslateSquarifiedNode(squarifiedNode, fixedFolder, squarified, scale)
				const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
				nodes.push(node)
			})
		}
		return nodes
	}

	private static scaleAndTranslateSquarifiedNode(
		squarifiedNode: HierarchyRectangularNode<CodeMapNode>,
		fixedFolder: CodeMapNode,
		squarified: SquarifiedTreeMap,
		scale: number
	) {
		// Transform coordinates from local folder space to world space (between 0 and 100).
		const scaleX = fixedFolder.fixedPosition.width / squarified.width
		const scaleY = fixedFolder.fixedPosition.height / squarified.height

		// Scales to usual map-size of 500 matching the three-scene-size
		squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedFolder.fixedPosition.left) * scale
		squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedFolder.fixedPosition.left) * scale
		squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedFolder.fixedPosition.top) * scale
		squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedFolder.fixedPosition.top) * scale
	}

	private static scaleRoot(root: Node, scale: number) {
		root.x0 *= scale
		root.y0 *= scale
		root.width *= scale
		root.length *= scale
	}

	private static getSquarifiedTreeMap(map: CodeMapNode, s: State): SquarifiedTreeMap {
		const hierarchyNode: HierarchyNode<CodeMapNode> = hierarchy<CodeMapNode>(map)
		const nodesPerSide = this.getEstimatedNodesPerSide(hierarchyNode)
		const padding: number = s.dynamicSettings.margin * TreeMapGenerator.PADDING_SCALING_FACTOR
		let mapWidth
		let mapHeight

		if (map.fixedPosition !== undefined) {
			mapWidth = map.fixedPosition.width
			mapHeight = map.fixedPosition.height
		} else {
			mapWidth = s.treeMap.mapSize * 2
			mapHeight = s.treeMap.mapSize * 2
		}

		const width = mapWidth + nodesPerSide * s.dynamicSettings.margin
		const height = mapHeight + nodesPerSide * s.dynamicSettings.margin

		const treeMap: TreemapLayout<CodeMapNode> = treemap<CodeMapNode>().size([width, height]).paddingOuter(padding).paddingInner(padding)

		return { treeMap: treeMap(hierarchyNode.sum(node => this.calculateAreaValue(node, s))), height, width }
	}

	private static getEstimatedNodesPerSide(hierarchyNode: HierarchyNode<CodeMapNode>): number {
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
