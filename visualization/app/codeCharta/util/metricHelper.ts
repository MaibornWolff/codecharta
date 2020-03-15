import { MetricData } from "../codeCharta.model"

export function isAnyMetricAvailable(metricData: MetricData[]) {
	return metricData.some(x => x.maxValue > 0)
}

export function isMetricUnavailable(metricData: MetricData[], metricName: string): boolean {
	return !metricData.some(x => x.maxValue > 0 && x.name == metricName)
}

export function getMetricNameFromIndexOrLast(metricData: MetricData[], index: number): string {
	const availableMetrics = metricData.filter(x => x.maxValue > 0)
	return availableMetrics[Math.min(index, availableMetrics.length - 1)].name
}
