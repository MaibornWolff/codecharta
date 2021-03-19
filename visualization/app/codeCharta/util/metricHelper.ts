import { NodeMetricData } from "../codeCharta.model"

export function isAnyMetricAvailable(metricData: NodeMetricData[]) {
	return metricData.some(x => x.maxValue > 0)
}

export function isMetricUnavailable(metricData: NodeMetricData[], metricName: string) {
	return !metricData.some(x => x.name === metricName)
}

export function getMetricNameFromIndexOrLast(metricData: NodeMetricData[], index: number) {
	let lastMetric: NodeMetricData
	for (const metric of metricData) {
		if (metric.maxValue > 0) {
			if (index-- === 0) {
				return metric.name
			}
			lastMetric = metric
		}
	}
	return lastMetric.name
}

export function resetToDefaultDistribution(metricData: NodeMetricData[]) {
	return metricData.filter(element => element.name === "rloc").length > 0 ? "rloc" : "unary"
}
