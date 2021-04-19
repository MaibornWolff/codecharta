import { CodeMapNode, Node, State, NodeMetricData, BlacklistType, LayoutAlgorithm } from "../../../codeCharta.model"
import BoundingBox from "./boundingBox"
import VerticalStreet from "./verticalStreet"
import HorizontalStreet from "./horizontalStreet"
import House from "./house"
import TreeMap from "./treeMap"
import { Vector2 } from "three"
import { StreetOrientation } from "./street"
import { getMapResolutionScaleFactor, isPathBlacklisted, isLeaf } from "../../codeMapHelper"
import { StreetViewHelper } from "./streetViewHelper"
import SquarifiedTreeMap from "./squarifiedTreeMap"

const MARGIN_SCALING_FACTOR = 0.02
const HEIGHT_SCALING_FACTOR = 0.1
export class StreetLayoutGenerator {
	static createStreetLayoutNodes(map: CodeMapNode, state: State, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
		const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
		const heightMetric = metricData.find(x => x.name === state.dynamicSettings.heightMetric)
		const maxHeight = heightMetric
			? (heightMetric.maxValue * mapSizeResolutionScaling) / HEIGHT_SCALING_FACTOR
			: mapSizeResolutionScaling

		const heightScale = (state.treeMap.mapSize * 2) / maxHeight
		const areaMetric = state.dynamicSettings.areaMetric
		const metricName = areaMetric ? areaMetric : "unary"
		const mergedMap = StreetViewHelper.mergeDirectories(map, metricName)
		const maxTreeMapFiles = state.appSettings.maxTreeMapFiles
		const childBoxes = this.createBoxes(mergedMap, metricName, state, StreetOrientation.Vertical, 0, maxTreeMapFiles)
		const rootStreet = new HorizontalStreet(mergedMap, childBoxes, 0)
		rootStreet.calculateDimension(metricName)
		const margin = state.dynamicSettings.margin * MARGIN_SCALING_FACTOR
		let layoutNodes = rootStreet.layout(margin, new Vector2(0, 0))

		if (metricData.length < 2) {
			layoutNodes = [map]
		}

		return layoutNodes.map(streetLayoutNode => {
			return StreetViewHelper.buildNodeFrom(streetLayoutNode as CodeMapNode, heightScale, maxHeight, state, isDeltaState)
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
			if (isPathBlacklisted(child.path, state.fileSettings.blacklist, BlacklistType.exclude)) {
				continue
			}
			if (isLeaf(child)) {
				children.push(new House(child))
				continue
			}
			const layoutAlgorithm = state.appSettings.layoutAlgorithm
			const fileDescendants = StreetLayoutGenerator.countFileDescendants(child)
			if (layoutAlgorithm === LayoutAlgorithm.TreeMapStreet && fileDescendants <= maxTreeMapFiles) {
				const treeMap = StreetLayoutGenerator.createTreeMap(child)
				children.push(treeMap)
			} else {
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
		return children
	}

	private static createStreet(node: CodeMapNode, orientation: StreetOrientation, children: BoundingBox[], depth: number) {
		return orientation === StreetOrientation.Horizontal
			? new HorizontalStreet(node, children, depth)
			: new VerticalStreet(node, children, depth)
	}

	private static createTreeMap(node: CodeMapNode): TreeMap {
		return new SquarifiedTreeMap(node)
	}

	private static countFileDescendants(folderNode: CodeMapNode): number {
		let totalFileNodes = 0
		for (const child of folderNode.children) {
			totalFileNodes += isLeaf(child) ? 1 : StreetLayoutGenerator.countFileDescendants(child)
		}
		return totalFileNodes
	}
}
