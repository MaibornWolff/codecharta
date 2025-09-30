import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap } from "d3-hierarchy"
import { CodeMapNode, DynamicSettings, NodeMetricData, CcState } from "../../../codeCharta.model"
import { isLeaf } from "../../codeMapHelper"
import { treeMapSize } from "./myAlgoHelper"
import { LayoutNode } from "../layoutNode"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 120
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2 = 95
const DEFAULT_ROOT_FLOOR_LABEL_SCALING = 0.035
const DEFAULT_SUB_FLOOR_LABEL_SCALING = 0.028

export function createMyAlgo(map: CodeMapNode, state: CcState, metricData: NodeMetricData[]): LayoutNode {
    const mapSizeResolutionScaling = 1 //getMapResolutionScaleFactor(state.files)
    const maxWidth = metricData.find(x => x.name === state.dynamicSettings.areaMetric)?.maxValue * mapSizeResolutionScaling

    const squarifiedTreeMap = getSquarifiedTreeMap(map, state, mapSizeResolutionScaling, maxWidth)

    return convertToLayoutNode(squarifiedTreeMap.treeMap, state, 0, 0, squarifiedTreeMap.height)
}

function convertToLayoutNode(
    hierarchyNode: HierarchyRectangularNode<CodeMapNode>,
    state: CcState,
    parentX1: number,
    parentY1: number,
    parentLength: number
): LayoutNode {
    const layoutNode = new LayoutNode(
        hierarchyNode.data.name,
        hierarchyNode.y1 - hierarchyNode.y0,
        hierarchyNode.x1 - hierarchyNode.x0,
        hierarchyNode.depth,
        isLeaf(hierarchyNode.data),
        {
            [state.dynamicSettings.areaMetric]: hierarchyNode.value
        }
    )

    // Calculate position relative to parent
    layoutNode.relativeX = hierarchyNode.y0 - parentY1
    layoutNode.relativeY = parentLength - hierarchyNode.x1 + parentX1

    if (hierarchyNode.children && hierarchyNode.children.length > 0) {
        layoutNode.children = hierarchyNode.children.map(child =>
            convertToLayoutNode(child, state, hierarchyNode.x0, hierarchyNode.y0, hierarchyNode.x1 - hierarchyNode.x0)
        )
    }

    return layoutNode
}

function getSquarifiedTreeMap(map: CodeMapNode, state: CcState, mapSizeResolutionScaling: number, maxWidth: number): SquarifiedTreeMap {
    const hierarchyNode = hierarchy(map)
    const nodesPerSide = getEstimatedNodesPerSide(hierarchyNode)
    const { enableFloorLabels, experimentalFeaturesEnabled, amountOfTopLabels } = state.appSettings
    const { margin } = state.dynamicSettings
    const padding = margin / 5.909063861065916

    let mapWidth
    let mapHeight

    if (map.fixedPosition !== undefined) {
        mapWidth = map.fixedPosition.width
        mapHeight = map.fixedPosition.height
    } else {
        mapWidth = treeMapSize * 2
        mapHeight = treeMapSize * 2
    }

    let addedLabelSpace = 0
    hierarchyNode.eachAfter(node => {
        // Precalculate the needed paddings for the floor folder labels to be able to expand the default map size
        // TODO fix estimation, estimation of added label space is inaccurate
        if (!isLeaf(node) && enableFloorLabels) {
            if (node.depth === 0) {
                addedLabelSpace += DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1
            }
            if (node.depth > 0 && node.depth < amountOfTopLabels) {
                addedLabelSpace += DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2
            }
        }
    })

    // nodesPerSide is just an estimation.
    // We do not know the exact amount,
    // because the treemap algorithm is/must be executed with an initial width and height afterwards.
    // TODO If it is wrong some buildings might be cut off.
    // Use mapSizeResolutionScaling to scale down the pixels need for rendering of the map (width and height size)
    const width = (mapWidth + nodesPerSide * margin + addedLabelSpace) * mapSizeResolutionScaling
    const height = (mapHeight + nodesPerSide * margin + addedLabelSpace) * mapSizeResolutionScaling

    let rootNode
    const treeMap = treemap<CodeMapNode>()
        .size([width, height])
        .paddingOuter(padding)
        .paddingInner(padding)
        .paddingRight(node => {
            if (!rootNode && node.parent === null) {
                rootNode = node
            }

            // TODO This will not work for FixedFolders
            // it seems that depth property is missing in that case
            // so the default padding will be added, which is fine though.
            if (rootNode && enableFloorLabels) {
                // Start the labels at level 1 not 0 because the root folder should not be labeled
                if (node.depth === 0) {
                    // Add a big padding for the first folder level (the font is bigger than in deeper levels)
                    return Math.max(
                        (rootNode.x1 - rootNode.x0) * DEFAULT_ROOT_FLOOR_LABEL_SCALING,
                        DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1
                    )
                }
                if (node.depth > 0 && node.depth < amountOfTopLabels) {
                    return Math.max((rootNode.x1 - rootNode.x0) * DEFAULT_SUB_FLOOR_LABEL_SCALING, DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2)
                }
            }

            // add treemap algorithm default padding otherwise
            return padding
        })

    return {
        treeMap: treeMap(
            hierarchyNode.sum(node => calculateAreaValue(node, state, maxWidth, experimentalFeaturesEnabled) * mapSizeResolutionScaling)
        ),
        height,
        width
    }
}

function getEstimatedNodesPerSide(hierarchyNode: HierarchyNode<CodeMapNode>) {
    let totalNodes = 0
    let blacklistedNodes = 0
    hierarchyNode.each(({ data }) => {
        if (data.isExcluded || data.isFlattened) {
            blacklistedNodes++
        }
        totalNodes++
    })

    // What does this line do?
    // Imagine a 3x3 grid of 9 nodes
    // 3 nodes are placed on the x-axis and 3 on the y-axis = 6
    // The calculated value is probably used to calculate the total margin which extends length and width of the map.
    return 2 * Math.sqrt(totalNodes - blacklistedNodes)
}

function isOnlyVisibleInComparisonMap(node: CodeMapNode, dynamicSettings: DynamicSettings) {
    return node.attributes[dynamicSettings.areaMetric] === 0 && node.deltas[dynamicSettings.heightMetric] < 0
}

// Only exported for testing.
export function calculateAreaValue(
    node: CodeMapNode,
    { dynamicSettings, appSettings, fileSettings }: CcState,
    maxWidth: number,
    experimentalFeaturesEnabled: boolean
) {
    if (node.isExcluded) {
        return 0
    }

    if (node.deltas && isOnlyVisibleInComparisonMap(node, dynamicSettings)) {
        return Math.abs(node.deltas[dynamicSettings.areaMetric])
    }

    if (isLeaf(node) && node.attributes?.[dynamicSettings.areaMetric]) {
        const areaMetric = dynamicSettings.areaMetric
        const attributeDescriptors = fileSettings.attributeDescriptors
        const isAttributeDirectionInversed = attributeDescriptors[areaMetric]?.direction === 1

        if (isAttributeDirectionInversed) {
            return appSettings.invertArea
                ? node.attributes[dynamicSettings.areaMetric]
                : maxWidth - node.attributes[dynamicSettings.areaMetric]
        }
        return appSettings.invertArea ? maxWidth - node.attributes[dynamicSettings.areaMetric] : node.attributes[dynamicSettings.areaMetric]
    }
    return experimentalFeaturesEnabled ? 0.5 : 0
}
