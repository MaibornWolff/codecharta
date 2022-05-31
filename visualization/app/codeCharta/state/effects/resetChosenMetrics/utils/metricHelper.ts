import { NodeMetricData, RecursivePartial, Settings } from "../../../../codeCharta.model"

export function isAnyMetricAvailable<T extends Pick<NodeMetricData, "maxValue">[]>(metricData: T) {
	return metricData.some(x => x.maxValue > 0)
}

export function isScenarioApplicable(scenario: RecursivePartial<Settings>, nodeMetricData: Pick<NodeMetricData, "name">[]) {
	const { areaMetric, heightMetric, colorMetric } = scenario.dynamicSettings
	const relevantMetrics = [areaMetric, heightMetric, colorMetric]
	const existingMetrics = new Set(nodeMetricData.map(x => x.name))
	return relevantMetrics.every(relevantMetric => existingMetrics.has(relevantMetric))
}

export function defaultNMetrics<T extends Pick<NodeMetricData, "maxValue" | "name">>(metricData: T[], n: number) {
	const defaultedMetrics: string[] = []
	let lastMetricNameWithValue: string
	for (const metric of metricData) {
		if (!metric.maxValue) {
			continue
		}
		defaultedMetrics.push(metric.name)
		lastMetricNameWithValue = metric.name
		if (--n === 0) {
			return defaultedMetrics
		}
	}

	if (!lastMetricNameWithValue) {
		throw new Error("there are no metrics available")
	}

	while (n-- > 0) {
		defaultedMetrics.push(lastMetricNameWithValue)
	}
	return defaultedMetrics
}
