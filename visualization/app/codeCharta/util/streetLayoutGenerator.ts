import { CodeMapNode, MetricData, Node, State, BlacklistType } from "../codeCharta.model"
import BoundingBox from "./algorithm/streetLayout/boundingBox"
import VerticalStreet from "./algorithm/streetLayout/verticalStreet"
import HorizontalStreet from "./algorithm/streetLayout/horizontalStreet"
import House from "./algorithm/streetLayout/house"
import Rectangle from "./algorithm/rectangle"
import Point from "./algorithm/point"
import { CodeMapHelper } from "./codeMapHelper"
import { LayoutNode, TreeMapHelper } from "./treemapHelper"
import SliceDiceTreemap from "./algorithm/treemap/sliceDiceTreemap"
import SquarifiedTreemap from "./algorithm/treemap/squarifiedTreemap"
import Treemap from "./algorithm/treemap/treemap"

export interface StreetLayoutValuedCodeMapNode {
	data: CodeMapNode
	value: number
	rect: Rectangle
	zOffset: number
}

enum StreetOrientation {
	Horizontal,
	Vertical
}

enum TreemapAlgorithm {
	Squarified,
	SliceAndDice
}

export class StreetLayoutGenerator {
	// private static HEIGHT_DIVISOR = 1
	private static MARGIN_SCALING_FACTOR = 0.02

	public static createStreetLayoutNodes(map: CodeMapNode, state: State, metricData: MetricData[], isDeltaState: boolean): Node[] {
		const metricName = state.dynamicSettings.areaMetric
		const childBoxes = this.createBoxes(map, metricName, state, StreetOrientation.Vertical, 1)
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
		depth: number
	): BoundingBox[] {
		const children: BoundingBox[] = []
		for (const child of node.children) {
			if (CodeMapHelper.isBlacklisted(child, state.fileSettings.blacklist, BlacklistType.exclude)) {
				continue
			}
			if (StreetLayoutGenerator.isNodeLeaf(child)) {
				children.push(new House(child))
			} else {
				if (depth >= Number.MAX_VALUE) {
					//TODO: add starting depth for treemap generation
					const treemap = StreetLayoutGenerator.createTreemap(child, TreemapAlgorithm.Squarified)
					children.push(treemap)
				} else {
					const streetChildren = StreetLayoutGenerator.createBoxes(child, metricName, state, 1 - orientation, depth + 1)
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

	private static createTreemap(node: CodeMapNode, treemapAlgorithm: TreemapAlgorithm): Treemap {
		switch (treemapAlgorithm) {
			case TreemapAlgorithm.SliceAndDice:
				return new SliceDiceTreemap(node)
			case TreemapAlgorithm.Squarified:
				return new SquarifiedTreemap(node)
			default:
				throw new Error("Treemap Algorithm not specified.")
		}
	}
}
