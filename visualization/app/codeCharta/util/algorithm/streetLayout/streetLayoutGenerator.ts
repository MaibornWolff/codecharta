import { CodeMapNode, Node, State, NodeMetricData } from "../../../codeCharta.model"
import BoundingBox, { StreetLayoutValuedCodeMapNode } from "./boundingBox"
import VerticalStreet from "./verticalStreet"
import HorizontalStreet from "./horizontalStreet"
import House from "./house"
import { Vector2 } from "three"
import { StreetOrientation } from "./street"
import { getMapResolutionScaleFactor } from "../../../ui/codeMap/codeMap.render.service"
import { isBlacklisted, isLeaf } from "../../codeMapHelper"
import Rectangle from "./rectangle"
import { StreetViewHelper } from "./streetViewHelper"

export interface LayoutNode {
	data: CodeMapNode
	value: number
	rect: Rectangle
	zOffset: number
}

export class StreetLayoutGenerator {
	private static MARGIN_SCALING_FACTOR = 0.02

	public static createStreetLayoutNodes(map: CodeMapNode, state: State, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
		const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
		const maxHeight = metricData.find(x => x.name === state.dynamicSettings.heightMetric).maxValue * mapSizeResolutionScaling
		const heightScale = (state.treeMap.mapSize * 2) / maxHeight
		
		const metricName = state.dynamicSettings.areaMetric
		const mergedMap = StreetViewHelper.mergeDirectories(map, metricName)
		// TODO add from store value
		const maxTreeMapFiles = 100 // state.appSettings.maxTreeMapFiles
		const childBoxes = this.createBoxes(mergedMap, metricName, state, StreetOrientation.Vertical, 0, maxTreeMapFiles)
		const rootStreet = new HorizontalStreet(mergedMap, childBoxes, 0)
		rootStreet.calculateDimension(metricName)
		const margin = state.dynamicSettings.margin * StreetLayoutGenerator.MARGIN_SCALING_FACTOR
		const layoutNodes: StreetLayoutValuedCodeMapNode[] = rootStreet.layout(new Vector2(0, 0), margin)
		
		
		return layoutNodes.map(streetLayoutNode => {
			return StreetViewHelper.buildNodeFrom(streetLayoutNode as LayoutNode, heightScale, maxHeight, state, isDeltaState)
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
			if (isBlacklisted(child)) {
				continue
			}
			if (isLeaf(child)) {
				children.push(new House(child))
			} else {
				// TODO add layoualgorithm chooser
				//const layoutAlgorithm = state.appSettings.layoutAlgorithm
				//const fileDescendants = StreetLayoutGenerator.countFileDescendants(child)
				/*if (layoutAlgorithm === LayoutAlgorithm.TMStreet && fileDescendants <= maxTreeMapFiles) {
					const treeMap = StreetLayoutGenerator.createTreeMap(child, TreeMapAlgorithm.Squarified)
					children.push(treeMap)
				} else*/ {
					child = StreetViewHelper.mergeDirectories(child, areaMetric)
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

	// TODO createTreeMap 
	/*private static createTreeMap(node: CodeMapNode, treeMapAlgorithm: TreeMapAlgorithm): TreeMap {
		switch (treeMapAlgorithm) {
			case TreeMapAlgorithm.Squarified:
				return new SquarifiedTreeMap(node)
			default:
				throw new Error("TreeMap Algorithm not specified.")
		}
	}*/

	private static countFileDescendants(folderNode: CodeMapNode): number {
		let totalFileNodes = 0
		for (const child of folderNode.children) {
			totalFileNodes += isLeaf(child) ? 1 : StreetLayoutGenerator.countFileDescendants(child)
		}
		return totalFileNodes
	}
}
