import { MetricDistribution } from "../../../util/fileExtension/fileExtensionCalculator"

const NO_DATA_AVAILABLE = "No data available"

export function formatDistributionLabel(item: MetricDistribution, showAbsoluteValues: boolean): string {
    const value = formatDistributionValue(item, showAbsoluteValues)
    return value === NO_DATA_AVAILABLE ? value : `${item.fileExtension} ${value}`
}

export function formatDistributionValue(item: MetricDistribution, showAbsoluteValues: boolean): string {
    if (showAbsoluteValues) {
        return item.absoluteMetricValue ? item.absoluteMetricValue.toLocaleString() : NO_DATA_AVAILABLE
    }
    return item.relativeMetricValue ? `${item.relativeMetricValue.toFixed(2)}%` : NO_DATA_AVAILABLE
}
