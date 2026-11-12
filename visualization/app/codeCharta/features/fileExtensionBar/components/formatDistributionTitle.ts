import { MetricDistribution } from "../../../util/fileExtension/fileExtensionCalculator"

export function formatDistributionTitle(item: MetricDistribution, showAbsoluteValues: boolean): string {
    const isDataAvailable = showAbsoluteValues ? item.absoluteMetricValue : item.relativeMetricValue
    if (!isDataAvailable) {
        return "No data available"
    }
    if (showAbsoluteValues) {
        return `${item.fileExtension} ${item.absoluteMetricValue.toLocaleString()}`
    }
    return `${item.fileExtension} ${item.relativeMetricValue.toFixed(2)}%`
}
