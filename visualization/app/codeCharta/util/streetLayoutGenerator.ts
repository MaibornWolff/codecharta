import { CodeMapNode, MetricData, Node, State, BlacklistType, TreeMapAlgorithm } from "../codeCharta.model"
import BoundingBox from "./algorithm/streetLayout/boundingBox"
import VerticalStreet from "./algorithm/streetLayout/verticalStreet"
import HorizontalStreet from "./algorithm/streetLayout/horizontalStreet"
import House from "./algorithm/streetLayout/house"
import Rectangle from "./algorithm/rectangle"
import Point from "./algorithm/point"
import { CodeMapHelper } from "./codeMapHelper"
import { LayoutNode, TreeMapHelper } from "./treeMapHelper"
import SliceDiceTreemap from "./algorithm/treemap/sliceDiceTreemap"
import SquarifiedTreemap from "./algorithm/treemap/squarifiedTreemap"
import Treemap from "./algorithm/treemap/treemap"
import { StreetOrientation } from "./algorithm/streetLayout/street"

export interface StreetLayoutValuedCodeMapNode {
	data: CodeMapNode
	value: number
	rect: Rectangle
	zOffset: number
}

export class StreetLayoutGenerator {
	// private static HEIGHT_DIVISOR = 1
	private static MARGIN_SCALING_FACTOR = 0.02

	public static createStreetLayoutNodes(
		map: CodeMapNode,
		state: State,
		metricData: MetricData[],
		treemapStartDepth = Number.MAX_VALUE,
		treemapAlgorithm = TreeMapAlgorithm.Squarified
	): Node[] {
		const isDeltaState = state.files.isDeltaState()
		const metricName = state.dynamicSettings.areaMetric
		const childBoxes = this.createBoxes(map, metricName, state, StreetOrientation.Vertical, 1, treemapStartDepth, treemapAlgorithm)
		const rootStreet = new HorizontalStreet(map, childBoxes, 0)
		rootStreet.calculateDimension(metricName)
		const margin = state.dynamicSettings.margin * StreetLayoutGenerator.MARGIN_SCALING_FACTOR
		const layoutNodes: StreetLayoutValuedCodeMapNode[] = rootStreet.layout(new Point(0, 0), margin)
		const maxHeight = metricData.find(x => x.name == state.dynamicSettings.heightMetric).maxValue
		const heightScale = 1 //TODO: apply correct height after scaling layout size
		return layoutNodes.map(streetLayoutNode => {
			return TreeMapHelper.buildNodeFrom(streetLayoutNode as LayoutNode, heightScale, maxHeight, state, isDeltaState)
		})
	}

	private static isNodeLeaf(node: CodeMapNode) {
		return !node.children || node.children.length === 0
	}

	private static createBoxes(
		node: CodeMapNode,
		metricName: string,
		state: State,
		orientation: StreetOrientation,
		depth: number,
		treemapStartDepth: number,
		treemapAlgorithm: TreeMapAlgorithm
	): BoundingBox[] {
		const children: BoundingBox[] = []
		for (const child of node.children) {
			if (CodeMapHelper.isBlacklisted(child, state.fileSettings.blacklist, BlacklistType.exclude)) {
				continue
			}
			if (StreetLayoutGenerator.isNodeLeaf(child)) {
				children.push(new House(child))
			} else {
				if (depth >= treemapStartDepth) {
					const treemap = StreetLayoutGenerator.createTreemap(child, treemapAlgorithm)
					children.push(treemap)
				} else {
					const streetChildren = StreetLayoutGenerator.createBoxes(
						child,
						metricName,
						state,
						1 - orientation,
						depth + 1,
						treemapStartDepth,
						treemapAlgorithm
					)
					children.push(StreetLayoutGenerator.createStreet(child, orientation, streetChildren, depth))
				}
			}
		}
		return children
	}

	private static createStreet(node: CodeMapNode, orientation: StreetOrientation, children: BoundingBox[], depth: number) {
		if (orientation === StreetOrientation.Horizontal) {
			return new HorizontalStreet(node, children, depth)
		} else {
			return new VerticalStreet(node, children, depth)
		}
	}

	private static createTreemap(node: CodeMapNode, treemapAlgorithm: TreeMapAlgorithm): Treemap {
		switch (treemapAlgorithm) {
			case TreeMapAlgorithm.SliceAndDice:
				return new SliceDiceTreemap(node)
			case TreeMapAlgorithm.Squarified:
				return new SquarifiedTreemap(node)
			default:
				throw new Error("Treemap Algorithm not specified.")
		}
	}
}
