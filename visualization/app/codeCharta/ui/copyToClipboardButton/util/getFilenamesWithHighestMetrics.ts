import { hierarchy } from "d3-hierarchy"
import { AttributeDescriptors, CodeMapNode, NodeType } from "../../../codeCharta.model"

export type FileToValue = { filePath: string; value: number }

const MAX_ENTRIES = 10

type ReducedCodeMapNode = Pick<CodeMapNode, "type" | "attributes" | "path"> & { children?: ReducedCodeMapNode[] }

export function getFilenamesWithHighestMetrics(
    node: ReducedCodeMapNode,
    attributeDescriptors: AttributeDescriptors
): Map<string, FileToValue[]> {
    const aggregatedMetrics = new Map<string, FileToValue[]>()

    for (const { data } of hierarchy(node)) {
        if (isFileNode(data)) {
            updateMetricsForNode(data, attributeDescriptors, aggregatedMetrics)
        }
    }

    return aggregatedMetrics
}

function isFileNode(node: ReducedCodeMapNode): boolean {
    return node.type === NodeType.FILE && node.attributes !== undefined
}

function updateMetricsForNode(
    node: ReducedCodeMapNode,
    attributeDescriptors: AttributeDescriptors,
    aggregatedMetrics: Map<string, FileToValue[]>
) {
    for (const [attribute, value] of Object.entries(node.attributes)) {
        const direction = attributeDescriptors?.[attribute]?.direction
        const metricEntry = { filePath: node.path, value }

        if (!aggregatedMetrics.has(attribute)) {
            aggregatedMetrics.set(attribute, [metricEntry])
        } else {
            const existingMetrics = aggregatedMetrics.get(attribute)
            insertMetricInOrder(existingMetrics, metricEntry, direction)
            aggregatedMetrics.set(attribute, existingMetrics.slice(0, MAX_ENTRIES))
        }
    }
}

function insertMetricInOrder(metrics: FileToValue[], newMetric: FileToValue, direction: number) {
    const comparisonFunction = getComparisonFunction(direction)
    const insertionIndex = metrics.findIndex(metric => comparisonFunction(newMetric, metric) < 0)

    if (insertionIndex === -1) {
        metrics.push(newMetric)
    } else {
        metrics.splice(insertionIndex, 0, newMetric)
    }
}

function getComparisonFunction(direction: number): (a: FileToValue, b: FileToValue) => number {
    return direction === 1 ? (a, b) => a.value - b.value : (a, b) => b.value - a.value
}
