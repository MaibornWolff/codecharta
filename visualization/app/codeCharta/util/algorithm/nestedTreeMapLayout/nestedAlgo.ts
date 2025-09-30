import { hierarchy } from "d3-hierarchy"
import { treemap } from "d3-hierarchy"
import { CodeMapNode, CcState, NodeMetricData } from "../../../codeCharta.model"
import { calculateAreaValue } from "../treeMapLayout/treeMapGenerator"
import { treeMapSize } from "../treeMapLayout/treeMapHelper"
import { getMapResolutionScaleFactor } from "../../codeMapHelper"
import { LayoutNode } from "../layoutNode"

export function generateNested(map: CodeMapNode, state: CcState, metricData: NodeMetricData[]): LayoutNode {
    const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)
    const maxWidth = metricData.find(x => x.name === state.dynamicSettings.areaMetric)?.maxValue * mapSizeResolutionScaling
    const { experimentalFeaturesEnabled } = state.appSettings

    const { treeMap } = getSquarifiedTreeMap(map, state, mapSizeResolutionScaling, maxWidth)

    return convertToLayoutNode(treeMap, state, maxWidth, experimentalFeaturesEnabled, 0, 0)
}

function convertToLayoutNode(
    hierarchyNode: any,
    state: CcState,
    maxWidth: number,
    experimentalFeaturesEnabled: boolean,
    parentX0: number,
    parentY0: number
): LayoutNode {
    const layoutNode = new LayoutNode(
        hierarchyNode.data.name,
        hierarchyNode.x1 - hierarchyNode.x0,
        hierarchyNode.y1 - hierarchyNode.y0,
        hierarchyNode.depth,
        isLeaf(hierarchyNode.data),
        hierarchyNode.data.attributes
    )

    // Calculate position relative to parent
    layoutNode.relativeX = hierarchyNode.x0 - parentX0
    layoutNode.relativeY = hierarchyNode.y0 - parentY0

    if (hierarchyNode.children && hierarchyNode.children.length > 0) {
        layoutNode.children = hierarchyNode.children.map((child: any) =>
            convertToLayoutNode(child, state, maxWidth, experimentalFeaturesEnabled, hierarchyNode.x0, hierarchyNode.y0)
        )
    }

    return layoutNode
}

function getSquarifiedTreeMap(map: CodeMapNode, state: CcState, mapSizeResolutionScaling: number, maxWidth: number) {
    const width = treeMapSize * 2 * mapSizeResolutionScaling
    const height = treeMapSize * 2 * mapSizeResolutionScaling
    const enableFloorLabels = state.appSettings.enableFloorLabels

    const margin = state.dynamicSettings.margin / 400

    const treeMap = treemap<CodeMapNode>()
        .size([width, height])
        .paddingOuter(margin) // Padding on the outer edges
        .paddingTop(enableFloorLabels ? 10 : margin) // Padding at the top of internal nodes
        .paddingInner(margin)(
        // Padding between sibling nodes
        hierarchy(map)
            .sum(d => calculateAreaValue(d, state, maxWidth, state.appSettings.experimentalFeaturesEnabled) * mapSizeResolutionScaling) // Sum leaf values for node size
            .sort((a, b) => b.value - a.value)
    ) // Sort nodes by value

    return { treeMap, width, height }
}

function isLeaf(node: CodeMapNode) {
    return !node.children || node.children.length === 0
}
