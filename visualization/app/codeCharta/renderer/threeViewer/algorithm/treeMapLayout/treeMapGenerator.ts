import { HierarchyNode, HierarchyRectangularNode, hierarchy, treemap } from "d3-hierarchy"
import { CcState, CodeMapNode, MapState, Node, NodeMetricData } from "../../../../model/codeCharta.model"
import { getMapResolutionScaleFactor, isLeaf } from "../../../../util/codeMapHelper"
import { TreeMapHelper, treeMapSize } from "./treeMapHelper"

type SquarifiedTreeMap = { treeMap: HierarchyRectangularNode<CodeMapNode>; height: number; width: number }

const PADDING_SCALING_FACTOR = 0.4
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1 = 120
const DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2 = 95
const DEFAULT_ROOT_FLOOR_LABEL_SCALING = 0.035
const DEFAULT_SUB_FLOOR_LABEL_SCALING = 0.028
// Maps the margin setting to a fraction of the average child footprint side,
// so that gaps scale with the buildings they separate instead of being absolute.
const MARGIN_TO_CHILD_SIZE_FRACTION = 0.000_5
const FLOOR_LABEL_MAX_FRACTION_OF_FOLDER = 0.15
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
    const maxHeight = metricData.find(x => x.name === state.mapState.heightMetric)?.maxValue * mapSizeResolutionScaling
    const maxWidth = metricData.find(x => x.name === state.mapState.areaMetric)?.maxValue * mapSizeResolutionScaling
    const heightScale = (treeMapSize * 2) / maxHeight

    if (hasFixedFolders(map)) {
        const hierarchyNode = hierarchy(map)

        const nodes: Node[] = [TreeMapHelper.buildRootFolderForFixedFolders(hierarchyNode.data, heightScale, state, isDeltaState)] // nosonar

        const totalMapSize = treeMapSize * 2 + getEstimatedNodesPerSide(hierarchyNode) * state.mapState.margin

        const scaleLength = totalMapSize / nodes[0].width
        const scaleWidth = totalMapSize / nodes[0].length

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
            const scaleX = fixedPosition.width / squarified.width
            const scaleY = fixedPosition.height / squarified.height

            squarifiedNode.x0 = (squarifiedNode.x0 * scaleX + fixedPosition.left) * scaleWidth
            squarifiedNode.x1 = (squarifiedNode.x1 * scaleX + fixedPosition.left) * scaleWidth
            squarifiedNode.y0 = (squarifiedNode.y0 * scaleY + fixedPosition.top) * scaleLength
            squarifiedNode.y1 = (squarifiedNode.y1 * scaleY + fixedPosition.top) * scaleLength

            squarifiedNode.x0 += offsetX0
            squarifiedNode.x1 += offsetX0
            squarifiedNode.y0 += offsetY0
            squarifiedNode.y1 += offsetY0

            const node = TreeMapHelper.buildNodeFrom(squarifiedNode, heightScale, maxHeight, state, isDeltaState)
            nodes.push(node)

            if (hasFixedFolders(fixedFolder.data)) {
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
                break
            }
        }
    }

    return nodes
}

function hasFixedFolders(map: CodeMapNode) {
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
    const { experimentalFeaturesEnabled } = state.preferences
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
        if (!isLeaf(node) && enableFloorLabels) {
            if (node.depth === 0) {
                addedLabelSpace += DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_1
            }
            if (node.depth > 0 && node.depth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY) {
                addedLabelSpace += DEFAULT_PADDING_FLOOR_LABEL_FROM_LEVEL_2
            }
        }
    })

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
            if (enableFloorLabels && node.depth < HIERARCHY_LEVELS_WITH_LABLES_UPPER_BOUNDARY) {
                return getFloorLabelPadding(node.x1 - node.x0, node.depth)
            }

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

    return 2 * Math.sqrt(totalNodes - blacklistedNodes)
}

function isOnlyVisibleInComparisonMap(node: CodeMapNode, mapState: MapState) {
    return node.attributes[mapState.areaMetric] === 0 && node.deltas[mapState.heightMetric] < 0
}

export function calculateAreaValue(
    node: CodeMapNode,
    { mapState, metricsLensSource }: CcState,
    maxWidth: number,
    experimentalFeaturesEnabled: boolean
) {
    if (node.isExcluded) {
        return 0
    }

    if (node.deltas && isOnlyVisibleInComparisonMap(node, mapState)) {
        return Math.abs(node.deltas[mapState.areaMetric])
    }

    if (isLeaf(node) && node.attributes?.[mapState.areaMetric]) {
        const areaMetric = mapState.areaMetric
        const attributeDescriptors = metricsLensSource.attributeDescriptors
        const isAttributeDirectionInversed = attributeDescriptors[areaMetric]?.direction === 1

        if (isAttributeDirectionInversed) {
            return mapState.invertArea ? node.attributes[mapState.areaMetric] : maxWidth - node.attributes[mapState.areaMetric]
        }
        return mapState.invertArea ? maxWidth - node.attributes[mapState.areaMetric] : node.attributes[mapState.areaMetric]
    }
    return experimentalFeaturesEnabled ? 0.5 : 0
}
