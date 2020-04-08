import { StreetLayoutHelper } from "./streetLayoutHelper"
import { CodeMapNode, MetricData, Node, State, BlacklistType } from "../codeCharta.model"
import BoundingBox from "./streetLayout/boundingBox"
import VerticalStreet from "./streetLayout/verticalStreet"
import HorizontalStreet from "./streetLayout/horizontalStreet"
import House from "./streetLayout/house"
import Rectangle from "./rectangle"
import SliceDiceTreemap from "./treemap/SliceDiceTreemap"
import Point from "./point"
import { CodeMapHelper } from "./codeMapHelper"
import SquarifiedTreemap from "./treemap/squarifiedTreemap"
import Treemap from "./treemap/Treemap"

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
	private static HEIGHT_DIVISOR = 1
	private static MARGIN_SCALING_FACTOR = 0.1

	public static createStreetLayoutNodes(map: CodeMapNode, s: State, metricData: MetricData[], isDeltaState: boolean): Node[] {
		const layoutNodes: StreetLayoutValuedCodeMapNode[] = this.getStreetLayout(map, s)
		const maxHeight = metricData.find(x => x.name == s.dynamicSettings.heightMetric).maxValue
		const heightScale = StreetLayoutGenerator.HEIGHT_DIVISOR // TODO: how to calculate height scale?
		return layoutNodes.map(streetLayoutNode => {
			return StreetLayoutHelper.createNode(streetLayoutNode, heightScale, maxHeight, s, isDeltaState)
		})
	}

	private static getStreetLayout(node: CodeMapNode, state: State): StreetLayoutValuedCodeMapNode[] {
		const metricName = state.dynamicSettings.areaMetric
		const childBoxes = this.createBoxes(node, metricName, state, StreetOrientation.Vertical, 1)
		const rootStreet = new HorizontalStreet(node, childBoxes, 0)
		rootStreet.calculateDimension(metricName)
		const margin = state.dynamicSettings.margin * StreetLayoutGenerator.MARGIN_SCALING_FACTOR
		return rootStreet.layout(new Point(0, 0), margin)
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
				if (depth >= 3) {
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

	public static setVisibilityOfNodeAndDescendants(node: CodeMapNode, visibility: boolean) {
		node.visible = visibility

		if (!StreetLayoutGenerator.isNodeLeaf(node)) {
			for (const child of node.children) {
				child.visible = visibility
				StreetLayoutGenerator.setVisibilityOfNodeAndDescendants(child, visibility)
			}
		}
		return node
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
