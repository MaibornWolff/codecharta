import { Vector2 } from "three"
import { CcState, CodeMapNode, LayoutAlgorithm, Node, NodeMetricData } from "../../../../model/codeCharta.model"
import { getMapResolutionScaleFactor, isLeaf } from "../../../../util/codeMapHelper"
import { ExcludeMatcher } from "../../../../util/nodeRules/excludeMatcher"
import { treeMapSize } from "../treeMapLayout/treeMapHelper"
import BoundingBox from "./boundingBox"
import HorizontalStreet from "./horizontalStreet"
import House from "./house"
import SquarifiedTreeMap from "./squarifiedTreeMap"
import { StreetOrientation } from "./street"
import { MergedFolder, StreetViewHelper } from "./streetViewHelper"
import TreeMap from "./treeMap"
import VerticalStreet from "./verticalStreet"

const MARGIN_SCALING_FACTOR = 0.02
export class StreetLayoutGenerator {
    static createStreetLayoutNodes(
        map: CodeMapNode,
        state: CcState,
        metricData: NodeMetricData[],
        matcher: ExcludeMatcher,
        isDeltaState: boolean
    ): Node[] {
        const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
        const maxHeight = metricData.find(x => x.name === state.mapState.heightMetric).maxValue * mapSizeResolutionScaling

        const metricName = state.mapState.areaMetric
        const mergedRoot = StreetViewHelper.mergeDirectories(map, metricName)
        const maxTreeMapFiles = state.preferences.maxTreeMapFiles
        const childBoxes = this.createBoxes(mergedRoot.node, metricName, state, matcher, StreetOrientation.Vertical, 1, maxTreeMapFiles)
        const rootStreet = this.createStreet(mergedRoot, StreetOrientation.Horizontal, childBoxes, 0)
        rootStreet.calculateDimension(metricName)
        const margin = state.mapState.margin * MARGIN_SCALING_FACTOR
        const layoutNodes = rootStreet.layout(margin, new Vector2(0, 0))

        return layoutNodes.map(streetLayoutNode => {
            return StreetViewHelper.buildNodeFrom(
                streetLayoutNode,
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
        matcher: ExcludeMatcher,
        orientation: StreetOrientation,
        depth: number,
        maxTreeMapFiles: number
    ): BoundingBox[] {
        const children: BoundingBox[] = []
        const areaMetric = state.mapState.areaMetric
        for (const child of node.children) {
            if (isLeaf(child)) {
                children.push(new House(child))
                continue
            }
            if (matcher.isExcludedSubtree(child.path)) {
                continue
            }

            const layoutAlgorithm = state.mapState.layoutAlgorithm
            const fileDescendants = StreetLayoutGenerator.countFileDescendants(child)
            if (layoutAlgorithm === LayoutAlgorithm.TreeMapStreet && fileDescendants <= maxTreeMapFiles) {
                const treeMap = StreetLayoutGenerator.createTreeMap(child)
                children.push(treeMap)
            } else {
                const mergedChild = StreetViewHelper.mergeDirectories(child, areaMetric)
                const streetChildren = StreetLayoutGenerator.createBoxes(
                    mergedChild.node,
                    metricName,
                    state,
                    matcher,
                    1 - orientation,
                    depth + 1,
                    maxTreeMapFiles
                )
                const street = StreetLayoutGenerator.createStreet(mergedChild, orientation, streetChildren, depth)
                children.push(street)
            }
        }
        return children
    }

    private static createStreet(folder: MergedFolder, orientation: StreetOrientation, children: BoundingBox[], depth: number) {
        const street =
            orientation === StreetOrientation.Horizontal
                ? new HorizontalStreet(folder.node, children, depth)
                : new VerticalStreet(folder.node, children, depth)
        street.label = folder.label
        return street
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
        const rootCoefficient = 0.005

        // Calculate linear and square root components
        const linearComponent = linearCoefficient * map.attributes.unary
        const rootComponent = Math.sqrt(map.attributes.unary) * rootCoefficient

        // Combine both components for the height scale calculation
        return ((treeMapSize * 2) / maxHeight) * (linearComponent + rootComponent)
    }
}
