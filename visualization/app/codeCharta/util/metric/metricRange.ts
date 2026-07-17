import { NodeMetricData } from "../../model/codeCharta.model"

export type MetricMinMax = {
    minValue: number
    maxValue: number
}

export type MetricRange = MetricMinMax & {
    values: number[]
}

export function rangeOfMetric(nodeMetricData: NodeMetricData[], metric: string): MetricRange {
    const data = nodeMetricData.find(metricData => metricData.name === metric)
    return {
        values: data?.values ?? [],
        minValue: data?.minValue ?? 0,
        maxValue: data?.maxValue ?? 0
    }
}
