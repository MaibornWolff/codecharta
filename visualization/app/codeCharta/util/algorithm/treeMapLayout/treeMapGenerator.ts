import { hierarchy, HierarchyNode, HierarchyRectangularNode, treemap } from "d3-hierarchy"
import { TreeMapHelper, treeMapSize } from "./treeMapHelper"
import { CodeMapNode, DynamicSettings, Node, NodeMetricData, CcState } from "../../../codeCharta.model"
import { getMapResolutionScaleFactor, isLeaf } from "../../codeMapHelper"

export type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

const PADDING_SCALING_FACTOR = 0.4
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 120
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2 = 95
const DEFAULT_ROOT_FLOOR_LABEL_SCALING = 0.035
const DEFAULT_SUB_FLOOR_LABEL_SCALING = 0.028
// Maps the margin setting to a fraction of the average child footprint side,
// so that gaps scale with the buildings they separate instead of being absolute.
const MARGIN_TO_CHILD_SIZE_FRACTION = 0.000_5
export const FLOOR_LABEL_MAX_FRACTION_OF_FOLDER = 0.15
export const HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY = 3

export function getFloorLabelPadding(folderWidth: number, depth: number) {
    const labelScaling = depth === 0 ? DEFAULT_ROOT_FLOOR_LABEL_SCALING : DEFAULT_SUB_FLOOR_LABEL_SCALING
    const minimumPadding = depth === 0 ? DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 : DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2
    // Reserve a strip proportional to the folder itself (not the root map) and
    // never more than a fixed fraction of the folder, so small folders are not consumed by their label.
    return Math.min(Math.max(folderWidth * labelScaling, minimumPadding), folderWidth * FLOOR_LABEL_MAX_FRACTION_OF_FOLDER)
}

export function createTreemapNodes(map: CodeMapNode, state: CcState, metricData: NodeMetricData[], isDeltaState: boolean): Node[] {
    const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
    const maxHeight = metricData.find(x => x.name === state.dynamicSettings.heightMetric)?.maxValue * mapSizeResolutionScaling
    const maxWidth = metricData.find(x => x.name === state.dynamicSettings.areaMetric)?.maxValue * mapSizeResolutionScaling
    const heightScale = (treeMapSize * 2) / maxHeight

    if (hasFixedFolders(map)) {
        const hierarchyNode = hierarchy(map)

        // Base root folder has width: 100px and length: 100px
        const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, state, isDeltaState)] // nosonar

        // Multiply mapSize of (default) 250px by 2 = 500px and add the total margin.
        // Uses the same margin compensation as getSquarifiedTreeMap so fixed-folder maps
        // are scaled consistently with regular maps.
        const totalMapSize = treeMapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.mapState.margin

        // than divide through the root folder width and length to get a scale factor for calculation for all following nodes.
        const scaleLength = totalMapSize / nodes[0].width
        const scaleWidth = totalMapSize / nodes[0].length

        // Scale the 100x100 root folder to be bigger and to match fixed/estimated totalMapSize
        scaleRoot(nodes[0], scaleLength, scaleWidth)

        return [
            ...nodes,
            ...buildSquarifiedTreeMapsForFixedFolders(
                hierarchyNode,
                state,
                scaleLength,
                scaleWidth,
                0,
                0,
                heightScale,
                maxHeight,
                maxWidth,
                isDeltaState,
                mapSizeResolutionScaling
            )
        ]
    }

    const squarifiedTreeMap = getSquarifiedTreeMap(map, state, mapSizeResolutionScaling, maxWidth)
    const nodes: Node[] = []
    for (const squarifiedNode of squarifiedTreeMap.treeMap) {
        nodes.push(TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState))
    }
    return nodes
}

function buildSquarifiedTreeMapsForFixedFolders(
    hierarchyNode: HierarchyNode<CodeMapNode>,
    state: CcState,
    scaleLength: number,
    scaleWidth: number,
    offsetX0: number,
    offsetY0: number,
    heightScale: number,
    maxHeight: number,
    maxWidth: number,
    isDeltaState: boolean,
    mapSizeResolutionScaling: number
) {
    const nodes = []

    for (const fixedFolder of hierarchyNode.children) {
        const fixedPosition = fixedFolder.data.fixedPosition
        const squarified = getSquarifiedTreeMap(fixedFolder.data, state, mapSizeResolutionScaling, maxWidth)

        for (const squarifiedNode of squarified.treeMap.descendants()) {
            // squarified.width/height is a sum of the fixedPosition.width/height and applied margins
            // The following scaling factors are used later to calculate out the original percentage fixed width/height.
            // Example: Width and Height fixed at 20. Added margins 42px (absolute value) for each = 62px
            //  20/62 = 0.322...       62 x 0.322... = 20 :)
            const scaleX = fixedPosition.width / squarified.width
            const scaleY = fixedPosition.height / squarified.height

            // Scale the fixed (percentage) positions of a node by the right scale factor, so that it will be placed properly.
            // The squarifiedNode coordinates x0, x1, y0, y1 are already assigned with positions from the treemap algorithm.
            squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedPosition.left) * scaleWidth
            squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedPosition.left) * scaleWidth
            squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedPosition.top) * scaleLength
            squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedPosition.top) * scaleLength

            // Add x and y (absolute px) offsets from parent fixed folder, if any.
            squarifiedNode.x0 += offsetX0
            squarifiedNode.x1 += offsetX0
            squarifiedNode.y0 += offsetY0
            squarifiedNode.y1 += offsetY0

            const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
            nodes.push(node)

            if (hasFixedFolders(fixedFolder.data)) {
                // Imagine the parent Folder has absolute px-width of 341px
                // We need to calculate a scale factor for the fixed child to transform a relative percentage fixed width/height to px.
                // Example: 20% of 341px:
                //  fixedWidth=20, parent Fixed Folder width: 341px => 20 * (scaleLength=341/100)
                // The original scaleWidth/scaleLength must be retained for the case that you have more than one fixedFolder on the same level.
                const childRelativeLengthScale = node.length / 100
                const childRelativeWidthScale = node.width / 100

                Array.prototype.push.apply(
                    nodes,
                    buildSquarifiedTreeMapsForFixedFolders(
                        fixedFolder,
                        state,
                        childRelativeLengthScale,
                        childRelativeWidthScale,
                        squarifiedNode.x0,
                        squarifiedNode.y0,
                        heightScale,
                        maxHeight,
                        maxWidth,
                        isDeltaState,
                        mapSizeResolutionScaling
                    )
                )

                // the break is actually needed!
                // the inner for-loop loops over the (parent) fixedFolder and its descendants.
                // if a direct child is a fixedFolder as well it will be handled by the recursive function call.
                // In this case, we must break the inner loop after handling the fixedFolder child recursively
                // and therefore prevent that the fixed child will be added as a node twice.
                break
            }
        }
    }

    return nodes
}

function hasFixedFolders(map: CodeMapNode) {
    // What if the second child of root is the first fixed folder?
    // Assumption: all children of the root folder require the fixedPosition attribute.
    return Boolean(map.children[0]?.fixedPosition)
}

function scaleRoot(root: Node, scaleLength: number, scaleWidth: number) {
    root.x0 *= scaleWidth
    root.y0 *= scaleLength
    root.width *= scaleWidth
    root.length *= scaleLength
}

function getSquarifiedTreeMap(map: CodeMapNode, state: CcState, mapSizeResolutionScaling: number, maxWidth: number): SquarifiedTreeMap {
    const hierarchyNode = hierarchy(map)
    const nodesPerSide = getEstimatedNodesPerSide(hierarchyNode)
    const { experimentalFeaturesEnabled } = state.appSettings
    const { enableFloorLabels, margin } = state.mapState
    const padding = margin * PADDING_SCALING_FACTOR * mapSizeResolutionScaling

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
            if (node.depth > 0 && node.depth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY) {
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

    // Padding is proportional to the average child footprint of each folder (and capped by the
    // configured absolute padding), so that crowded or deeply nested folders are not eaten up by
    // fixed pixel gaps. Fixed gaps squeezed small buildings to zero area and made the drawn area
    // of equally sized files differ by orders of magnitude between folders.
    const proportionalPadding = (node: HierarchyRectangularNode<CodeMapNode>) => {
        const nodeWidth = node.x1 - node.x0
        const nodeHeight = node.y1 - node.y0
        const averageChildSide = Math.sqrt((nodeWidth * nodeHeight) / (node.children?.length ?? 1))
        return Math.min(padding, margin * MARGIN_TO_CHILD_SIZE_FRACTION * averageChildSide)
    }

    const treeMap = treemap<CodeMapNode>()
        .size([width, height])
        .paddingOuter(node => proportionalPadding(node) / 2)
        .paddingInner(proportionalPadding)
        .paddingRight(node => {
            // TODO This will not work for FixedFolders
            // it seems that depth property is missing in that case
            // so the default padding will be added, which is fine though.
            if (enableFloorLabels && node.depth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY) {
                return getFloorLabelPadding(node.x1 - node.x0, node.depth)
            }

            // add treemap algorithm default padding otherwise
            return proportionalPadding(node) / 2
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
    { dynamicSettings, mapState, fileSettings }: CcState,
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
            return mapState.invertArea
                ? node.attributes[dynamicSettings.areaMetric]
                : maxWidth - node.attributes[dynamicSettings.areaMetric]
        }
        return mapState.invertArea ? maxWidth - node.attributes[dynamicSettings.areaMetric] : node.attributes[dynamicSettings.areaMetric]
    }
    return experimentalFeaturesEnabled ? 0.5 : 0
}
