import { CodeMapNode, MetricData, Node, State, BlacklistType, TreeMapAlgorithm, LayoutAlgorithm } from "../codeCharta.model"
import BoundingBox from "./algorithm/streetLayout/boundingBox"
import VerticalStreet from "./algorithm/streetLayout/verticalStreet"
import HorizontalStreet from "./algorithm/streetLayout/horizontalStreet"
import House from "./algorithm/streetLayout/house"
import Rectangle from "./algorithm/rectangle"
import Point from "./algorithm/point"
import { CodeMapHelper } from "./codeMapHelper"
import TreeMap from "./algorithm/treeMap/treeMap"
import SliceDiceTreeMap from "./algorithm/treeMap/sliceDiceTreeMap"
import SquarifiedTreeMap from "./algorithm/treeMap/squarifiedTreeMap"
import StripTreeMap from "./algorithm/treeMap/stripTreeMap"
import { StreetOrientation } from "./algorithm/streetLayout/street"
import { StreetLayoutHelper } from "./streetLayoutHelper"
import { LayoutHelper, LayoutNode } from "./layoutHelper"

export interface StreetLayoutValuedCodeMapNode {
	data: CodeMapNode
	value: number
	rect: Rectangle
	zOffset: number
}

export class StreetLayoutGenerator {
	private static MARGIN_SCALING_FACTOR = 0.02

	public static createStreetLayoutNodes(map: CodeMapNode, state: State, metricData: MetricData[]): Node[] {
		const isDeltaState = state.files.isDeltaState()
		const metricName = state.dynamicSettings.areaMetric
		const mergedMap = LayoutHelper.mergeDirectories(map, metricName)
		const maxTreeMapFiles = state.appSettings.maxTreeMapFiles
		const childBoxes = this.createBoxes(mergedMap, metricName, state, StreetOrientation.Vertical, 0, maxTreeMapFiles)
		const rootStreet = new HorizontalStreet(mergedMap, childBoxes, 0)
		rootStreet.calculateDimension(metricName)
		const margin = state.dynamicSettings.margin * StreetLayoutGenerator.MARGIN_SCALING_FACTOR
		const layoutNodes: StreetLayoutValuedCodeMapNode[] = rootStreet.layout(new Point(0, 0), margin)
		const maxHeight = metricData.find(x => x.name == state.dynamicSettings.heightMetric).maxValue
		const heightScale = 1 //TODO: apply correct height after scaling layout size
		return layoutNodes.map(streetLayoutNode => {
			return LayoutHelper.buildNodeFrom(streetLayoutNode as LayoutNode, heightScale, maxHeight, state, isDeltaState)
		})
	}

	private static createBoxes(
		node: CodeMapNode,
		metricName: string,
		state: State,
		orientation: StreetOrientation,
		depth: number,
		maxTreeMapFiles: number
	): BoundingBox[] {
		const children: BoundingBox[] = []
		const areaMetric = state.dynamicSettings.areaMetric
		for (let child of node.children) {
			if (CodeMapHelper.isBlacklisted(child, state.fileSettings.blacklist, BlacklistType.exclude)) {
				continue
			}
			if (LayoutHelper.isNodeLeaf(child)) {
				children.push(new House(child))
			} else {
				const layoutAlgorithm = state.appSettings.layoutAlgorithm
				const fileDescendants = StreetLayoutHelper.countFileDescendants(child)
				if (layoutAlgorithm === LayoutAlgorithm.TMStreet && fileDescendants <= maxTreeMapFiles) {
					const treeMap = StreetLayoutGenerator.createTreeMap(child, TreeMapAlgorithm.Squarified)
					children.push(treeMap)
				} else {
					child = LayoutHelper.mergeDirectories(child, areaMetric)
					const streetChildren = StreetLayoutGenerator.createBoxes(
						child,
						metricName,
						state,
						1 - orientation,
						depth + 1,
						maxTreeMapFiles
					)
					const street = StreetLayoutGenerator.createStreet(child, orientation, streetChildren, depth)
					children.push(street)
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

	private static createTreeMap(node: CodeMapNode, treeMapAlgorithm: TreeMapAlgorithm): TreeMap {
		switch (treeMapAlgorithm) {
			case TreeMapAlgorithm.SliceAndDice:
				return new SliceDiceTreeMap(node)
			case TreeMapAlgorithm.Squarified:
				return new SquarifiedTreeMap(node)
			case TreeMapAlgorithm.Strip:
				return new StripTreeMap(node)
			default:
				throw new Error("TreeMap Algorithm not specified.")
		}
	}
}
