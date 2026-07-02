import { createSelector } from "@ngrx/store"
import { AttributeDescriptor, AttributeDescriptors, CodeMapNode, MapColors, PrimaryMetrics } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { mapColorsSelector } from "../../../mapState/mapState.facade"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

export type MappingBlockKind = "area" | "height" | "color" | "edge"

export type MappingBlock = {
    kind: MappingBlockKind
    metricName: string
    value?: number
    inverted?: boolean
    incoming?: number
    outgoing?: number
    descriptor?: AttributeDescriptor
}

export const _calculateMappingBlocks = (
    primaryMetricNames: PrimaryMetrics,
    attributeDescriptors: AttributeDescriptors,
    mapColors: MapColors,
    isDeltaState: boolean,
    selectedNode?: CodeMapNode
): MappingBlock[] => {
    const blocks: MappingBlock[] = []

    const areaBlock = createNodeMetricBlock("area", primaryMetricNames.areaMetric, attributeDescriptors, selectedNode)
    if (areaBlock) {
        blocks.push(areaBlock)
    }

    const heightBlock = createNodeMetricBlock("height", primaryMetricNames.heightMetric, attributeDescriptors, selectedNode)
    if (heightBlock) {
        blocks.push(heightBlock)
    }

    const colorBlock = createNodeMetricBlock("color", primaryMetricNames.colorMetric, attributeDescriptors, selectedNode)
    if (colorBlock && !isDeltaState) {
        blocks.push({ ...colorBlock, inverted: mapColors.isColorRangeInverted === true })
    }

    const edgeBlock = createEdgeMetricBlock(primaryMetricNames.edgeMetric, attributeDescriptors, selectedNode)
    if (edgeBlock) {
        blocks.push(edgeBlock)
    }

    return blocks
}

const createNodeMetricBlock = (
    kind: MappingBlockKind,
    metricName: string | null,
    attributeDescriptors: AttributeDescriptors,
    selectedNode?: CodeMapNode
): MappingBlock | undefined => {
    if (!metricName) {
        return undefined
    }
    return {
        kind,
        metricName,
        value: selectedNode?.attributes?.[metricName],
        descriptor: attributeDescriptors?.[metricName]
    }
}

const createEdgeMetricBlock = (
    edgeMetricName: string | null,
    attributeDescriptors: AttributeDescriptors,
    selectedNode?: CodeMapNode
): MappingBlock | undefined => {
    if (!edgeMetricName) {
        return undefined
    }
    const edgeCount = selectedNode?.edgeAttributes?.[edgeMetricName]
    if (!edgeCount) {
        return undefined
    }
    return {
        kind: "edge",
        metricName: edgeMetricName,
        incoming: edgeCount.incoming ?? 0,
        outgoing: edgeCount.outgoing ?? 0,
        descriptor: attributeDescriptors?.[edgeMetricName]
    }
}

export const inspectorMappingBlocksSelector = createSelector(
    primaryMetricNamesSelector,
    attributeDescriptorsSelector,
    mapColorsSelector,
    isDeltaStateSelector,
    selectedNodeSelector,
    _calculateMappingBlocks
)
