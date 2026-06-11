import { createSelector } from "@ngrx/store"
import { AttributeDescriptor, AttributeDescriptors, CodeMapNode } from "../../../codeCharta.model"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { calculateMetricBar, MetricSeverity } from "../util/metricSeverity"

export type MetricRow = {
    name: string
    value: number
    delta?: number
    fraction: number
    severity: MetricSeverity
    descriptor?: AttributeDescriptor
}

const UNARY_METRIC = "unary"

export const _calculateMetricRows = (
    selectedNode: CodeMapNode | undefined,
    rootNode: CodeMapNode | undefined,
    attributeDescriptors: AttributeDescriptors
): MetricRow[] => {
    if (!selectedNode?.attributes) {
        return []
    }
    return Object.keys(selectedNode.attributes)
        .filter(metricName => metricName !== UNARY_METRIC)
        .sort((metricNameA, metricNameB) => metricNameA.localeCompare(metricNameB))
        .map(metricName => createMetricRow(metricName, selectedNode, rootNode, attributeDescriptors))
}

const createMetricRow = (
    metricName: string,
    selectedNode: CodeMapNode,
    rootNode: CodeMapNode | undefined,
    attributeDescriptors: AttributeDescriptors
): MetricRow => {
    const descriptor = attributeDescriptors?.[metricName]
    const value = selectedNode.attributes[metricName]
    const mapTotal = rootNode?.attributes?.[metricName]
    const { fraction, severity } = calculateShareOfMapBar(value, mapTotal, descriptor?.direction)
    return {
        name: metricName,
        value,
        delta: selectedNode.deltas?.[metricName],
        fraction,
        severity,
        descriptor
    }
}

const calculateShareOfMapBar = (value: number, mapTotal: number | undefined, direction?: number) => {
    return calculateMetricBar(value, 0, mapTotal, direction)
}

export const inspectorMetricRowsSelector = createSelector(
    selectedNodeSelector,
    accumulatedDataSelector,
    attributeDescriptorsSelector,
    (selectedNode, accumulatedData, attributeDescriptors) =>
        _calculateMetricRows(selectedNode, accumulatedData.unifiedMapNode, attributeDescriptors)
)
