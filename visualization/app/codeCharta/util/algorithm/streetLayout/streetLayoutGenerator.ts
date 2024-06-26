import { CcState, CodeMapNode, LayoutAlgorithm, Node, NodeMetricData } from "../../../codeCharta.model"
import BoundingBox from "./boundingBox"
import VerticalStreet from "./verticalStreet"
import HorizontalStreet from "./horizontalStreet"
import House from "./house"
import TreeMap from "./treeMap"
import { Vector2 } from "three"
import { StreetOrientation } from "./street"
import { getMapResolutionScaleFactor, isLeaf, isPathBlacklisted } from "../../codeMapHelper"
import { StreetViewHelper } from "./streetViewHelper"
import SquarifiedTreeMap from "./squarifiedTreeMap"
import { treeMapSize } from "../treeMapLayout/treeMapHelper"

const MARGIN_SCALING_FACTOR = 0.02
export class StreetLayoutGenerator {
    static createStreetLayoutNodes(map: CodeMapNode, state: CcState, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
        const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
        const maxHeight = metricData.find(x => x.name === state.dynamicSettings.heightMetric).maxValue * mapSizeResolutionScaling

        const metricName = state.dynamicSettings.areaMetric
        const mergedMap = StreetViewHelper.mergeDirectories(map, metricName)
        const maxTreeMapFiles = state.appSettings.maxTreeMapFiles
        const childBoxes = this.createBoxes(mergedMap, metricName, state, StreetOrientation.Vertical, 0, maxTreeMapFiles)
        const rootStreet = new HorizontalStreet(mergedMap, childBoxes, 0)
        rootStreet.calculateDimension(metricName)
        const margin = state.dynamicSettings.margin * MARGIN_SCALING_FACTOR
        const layoutNodes = rootStreet.layout(margin, new Vector2(0, 0))

        return layoutNodes.map(streetLayoutNode => {
            return StreetViewHelper.buildNodeFrom(
                streetLayoutNode as CodeMapNode,
                this.calculateHeightScale(map, treeMapSize, maxHeight),
                maxHeight,
                state,
                isDeltaState
            )
        })
    }

    private static createBoxes(
        node: CodeMapNode,
        metricName: string,
        state: CcState,
        orientation: StreetOrientation,
        depth: number,
        maxTreeMapFiles: number
    ): BoundingBox[] {
        const children: BoundingBox[] = []
        const areaMetric = state.dynamicSettings.areaMetric
        for (let child of node.children) {
            if (isPathBlacklisted(child.path, state.fileSettings.blacklist, "exclude")) {
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

    private static calculateHeightScale(map: CodeMapNode, treeMapSize: number, maxHeight: number): number {
        // Constants to control the curve and scaling
        const linearCoefficient = 0.0001
        const rootCoefficient = 0.01

        // Calculate linear and square root components
        const linearComponent = linearCoefficient * map.attributes.unary
        const rootComponent = Math.sqrt(map.attributes.unary) * rootCoefficient

        // Combine both components for the height scale calculation
        return ((treeMapSize * 2) / maxHeight) * (linearComponent + rootComponent)
    }
}
