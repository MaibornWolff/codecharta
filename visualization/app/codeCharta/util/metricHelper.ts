import { MetricData } from "../codeCharta.model"

export function isAnyMetricAvailable(metricData: MetricData[]) {
	const availableMetrics: MetricData[] = metricData.filter(x => x.availableInVisibleMaps && x.maxValue > 0)
	return metricData.length > 1 && availableMetrics.length > 0
}

export function getResetMetricName(metricData: MetricData[], metricName: string, index: number): string {
	if (isMetricUnavailable(metricData, metricName)) {
		return getMetricNameFromIndexOrLast(metricData, index)
	}
}

export function isMetricUnavailable(metricData: MetricData[], metricName: string): boolean {
	return !metricData.find(x => x.availableInVisibleMaps && x.maxValue > 0 && x.name == metricName)
}

export function getMetricNameFromIndexOrLast(metricData: MetricData[], index: number): string {
	const availableMetrics = metricData.filter(x => x.availableInVisibleMaps && x.maxValue > 0)
	return availableMetrics[Math.min(index, availableMetrics.length - 1)].name
}
