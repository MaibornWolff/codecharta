import { NodeMetricData } from "../codeCharta.model"

export function isAnyMetricAvailable(metricData: NodeMetricData[]) {
	return metricData.some(x => x.maxValue > 0)
}

export function isMetricUnavailable(metricData: NodeMetricData[], metricName: string) {
	return !metricData.some(x => x.maxValue > 0 && x.name === metricName)
}

export function getMetricNameFromIndexOrLast(metricData: NodeMetricData[], index: number) {
	const availableMetrics = metricData.filter(x => x.maxValue > 0)
	return availableMetrics[Math.min(index, availableMetrics.length - 1)].name
}
