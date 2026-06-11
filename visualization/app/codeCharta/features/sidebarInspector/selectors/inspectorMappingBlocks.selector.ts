import { createSelector } from "@ngrx/store"
import { AttributeDescriptor, AttributeDescriptors, CodeMapNode, MapColors, MetricData, PrimaryMetrics } from "../../../codeCharta.model"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

export type MappingBlockKind = "area" | "height" | "color" | "edge"

export type MappingBlock = {
    kind: MappingBlockKind
    metricName: string
    min: number
    max: number
    inverted?: boolean
    incoming?: number
    outgoing?: number
    descriptor?: AttributeDescriptor
}

export const _calculateMappingBlocks = (
    primaryMetricNames: PrimaryMetrics,
    metricData: Pick<MetricData, "nodeMetricData" | "edgeMetricData">,
    attributeDescriptors: AttributeDescriptors,
    mapColors: MapColors,
    isDeltaState: boolean,
    selectedNode?: CodeMapNode
): MappingBlock[] => {
    const blocks: MappingBlock[] = []

    const areaBlock = createNodeMetricBlock("area", primaryMetricNames.areaMetric, metricData, attributeDescriptors)
    if (areaBlock) {
        blocks.push(areaBlock)
    }

    const heightBlock = createNodeMetricBlock("height", primaryMetricNames.heightMetric, metricData, attributeDescriptors)
    if (heightBlock) {
        blocks.push(heightBlock)
    }

    const colorBlock = createNodeMetricBlock("color", primaryMetricNames.colorMetric, metricData, attributeDescriptors)
    if (colorBlock && !isDeltaState) {
        blocks.push({ ...colorBlock, inverted: mapColors.isColorRangeInverted === true })
    }

    const edgeBlock = createEdgeMetricBlock(primaryMetricNames.edgeMetric, metricData, attributeDescriptors, selectedNode)
    if (edgeBlock) {
        blocks.push(edgeBlock)
    }

    return blocks
}

const createNodeMetricBlock = (
    kind: MappingBlockKind,
    metricName: string | null,
    metricData: Pick<MetricData, "nodeMetricData">,
    attributeDescriptors: AttributeDescriptors
): MappingBlock | undefined => {
    if (!metricName) {
        return undefined
    }
    const range = metricData.nodeMetricData.find(metric => metric.name === metricName)
    return {
        kind,
        metricName,
        min: range?.minValue ?? 0,
        max: range?.maxValue ?? 0,
        descriptor: attributeDescriptors?.[metricName]
    }
}

const createEdgeMetricBlock = (
    edgeMetricName: string | null,
    metricData: Pick<MetricData, "edgeMetricData">,
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
    const range = metricData.edgeMetricData.find(metric => metric.name === edgeMetricName)
    return {
        kind: "edge",
        metricName: edgeMetricName,
        min: range?.minValue ?? 0,
        max: range?.maxValue ?? 0,
        incoming: edgeCount.incoming ?? 0,
        outgoing: edgeCount.outgoing ?? 0,
        descriptor: attributeDescriptors?.[edgeMetricName]
    }
}

export const inspectorMappingBlocksSelector = createSelector(
    primaryMetricNamesSelector,
    metricDataSelector,
    attributeDescriptorsSelector,
    mapColorsSelector,
    isDeltaStateSelector,
    selectedNodeSelector,
    _calculateMappingBlocks
)
