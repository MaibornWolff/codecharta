import { createSelector } from "@ngrx/store"
import { AttributeDescriptor, AttributeDescriptors, CodeMapNode, MetricData } from "../../../codeCharta.model"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { calculateMetricBar, MetricBar } from "../util/metricSeverity"

export type MetricRow = {
    name: string
    value: number
    delta?: number
    mapBar: MetricBar
    rangeBar: MetricBar
    descriptor?: AttributeDescriptor
}

export const isEmptyMetricValue = (value?: number) => {
    return !value
}

export const isEmptyMetricRow = (row: Pick<MetricRow, "value" | "delta">) => {
    return isEmptyMetricValue(row.value) && !row.delta
}

const EMPTY_METRIC_BAR: MetricBar = { fraction: 0, severity: "neutral" }

const UNARY_METRIC = "unary"

export const _calculateMetricRows = (
    selectedNode: CodeMapNode | undefined,
    rootNode: CodeMapNode | undefined,
    metricData: Pick<MetricData, "nodeMetricData">,
    attributeDescriptors: AttributeDescriptors
): MetricRow[] => {
    if (!selectedNode?.attributes) {
        return []
    }
    return Object.keys(selectedNode.attributes)
        .filter(metricName => metricName !== UNARY_METRIC)
        .sort((metricNameA, metricNameB) => metricNameA.localeCompare(metricNameB))
        .map(metricName => createMetricRow(metricName, selectedNode, rootNode, metricData, attributeDescriptors))
}

const createMetricRow = (
    metricName: string,
    selectedNode: CodeMapNode,
    rootNode: CodeMapNode | undefined,
    metricData: Pick<MetricData, "nodeMetricData">,
    attributeDescriptors: AttributeDescriptors
): MetricRow => {
    const descriptor = attributeDescriptors?.[metricName]
    const value = selectedNode.attributes[metricName]
    return {
        name: metricName,
        value,
        delta: selectedNode.deltas?.[metricName],
        mapBar: calculateShareOfMapBar(metricName, value, rootNode, descriptor),
        rangeBar: calculateRangeBar(metricName, value, metricData, descriptor),
        descriptor
    }
}

const calculateShareOfMapBar = (
    metricName: string,
    value: number,
    rootNode: CodeMapNode | undefined,
    descriptor?: AttributeDescriptor
): MetricBar => {
    if (isEmptyMetricValue(value)) {
        return EMPTY_METRIC_BAR
    }
    const mapTotal = rootNode?.attributes?.[metricName]
    return calculateMetricBar(value, 0, mapTotal, descriptor?.direction)
}

const calculateRangeBar = (
    metricName: string,
    value: number,
    metricData: Pick<MetricData, "nodeMetricData">,
    descriptor?: AttributeDescriptor
): MetricBar => {
    if (isEmptyMetricValue(value)) {
        return EMPTY_METRIC_BAR
    }
    const range = metricData.nodeMetricData.find(metric => metric.name === metricName)
    return calculateMetricBar(value, range?.minValue, range?.maxValue, descriptor?.direction)
}

export const inspectorMetricRowsSelector = createSelector(
    selectedNodeSelector,
    accumulatedDataSelector,
    metricDataSelector,
    attributeDescriptorsSelector,
    (selectedNode, accumulatedData, metricData, attributeDescriptors) =>
        _calculateMetricRows(selectedNode, accumulatedData.unifiedMapNode, metricData, attributeDescriptors)
)
