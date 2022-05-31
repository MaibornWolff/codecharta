import { NodeMetricData } from "../../../../codeCharta.model"

export function isAnyMetricAvailable(metricData: Pick<NodeMetricData, "maxValue">[]) {
	return metricData.some(x => x.maxValue > 0)
}

export function isMetricUnavailable(metricData: Pick<NodeMetricData, "maxValue" | "name">[], metricName: string) {
	return !metricData.some(x => x.maxValue > 0 && x.name === metricName)
}

export function getMetricNameFromIndexOrLast<T extends Pick<NodeMetricData, "maxValue" | "name">>(metricData: T[], index: number) {
	return metricData[index < metricData.length ? index : metricData.length - 1].name
}
