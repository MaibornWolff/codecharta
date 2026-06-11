import { createSelector } from "@ngrx/store"
import { AttributeDescriptor, AttributeDescriptors, CodeMapNode, MetricData } from "../../../codeCharta.model"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"
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
    metricData: Pick<MetricData, "nodeMetricData">,
    attributeDescriptors: AttributeDescriptors
): MetricRow[] => {
    if (!selectedNode?.attributes) {
        return []
    }
    return Object.keys(selectedNode.attributes)
        .filter(metricName => metricName !== UNARY_METRIC)
        .sort((metricNameA, metricNameB) => metricNameA.localeCompare(metricNameB))
        .map(metricName => createMetricRow(metricName, selectedNode, metricData, attributeDescriptors))
}

const createMetricRow = (
    metricName: string,
    selectedNode: CodeMapNode,
    metricData: Pick<MetricData, "nodeMetricData">,
    attributeDescriptors: AttributeDescriptors
): MetricRow => {
    const descriptor = attributeDescriptors?.[metricName]
    const range = metricData.nodeMetricData.find(metric => metric.name === metricName)
    const value = selectedNode.attributes[metricName]
    const { fraction, severity } = calculateMetricBar(value, range?.minValue, range?.maxValue, descriptor?.direction)
    return {
        name: metricName,
        value,
        delta: selectedNode.deltas?.[metricName],
        fraction,
        severity,
        descriptor
    }
}

export const inspectorMetricRowsSelector = createSelector(
    selectedNodeSelector,
    metricDataSelector,
    attributeDescriptorsSelector,
    _calculateMetricRows
)
