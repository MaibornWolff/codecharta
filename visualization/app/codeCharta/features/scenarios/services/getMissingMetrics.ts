import { MetricData } from "../../../codeCharta.model"
import { MetricsSection } from "../model/scenario.model"

export interface MissingMetrics {
    nodeMetrics: string[]
    edgeMetrics: string[]
}

export function getMissingMetrics(metricsSection: MetricsSection, metricData: MetricData): MissingMetrics {
    const availableNodeMetrics = new Set(metricData.nodeMetricData.map(m => m.name))
    const availableEdgeMetrics = new Set(metricData.edgeMetricData.map(m => m.name))

    const requiredNodeMetrics = [
        metricsSection.areaMetric,
        metricsSection.heightMetric,
        metricsSection.colorMetric,
        metricsSection.distributionMetric
    ]

    const nodeMetrics = [...new Set(requiredNodeMetrics.filter(m => !availableNodeMetrics.has(m)))]
    const edgeMetrics = metricsSection.edgeMetric && !availableEdgeMetrics.has(metricsSection.edgeMetric) ? [metricsSection.edgeMetric] : []

    return { nodeMetrics, edgeMetrics }
}

export function hasMissingMetrics(missing: MissingMetrics): boolean {
    return missing.nodeMetrics.length > 0 || missing.edgeMetrics.length > 0
}
