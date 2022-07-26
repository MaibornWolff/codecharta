import { NodeMetricData, RecursivePartial, Settings } from "../../../../codeCharta.model"

const sizeMetrics = ["rloc", "real_lines_of_code", "loc", "lines_of_code", "lines", "statements", "functions"]
const complexityMetrics = ["mcc", "cognitive_complexity", "sonar_cognitive_complexity", "max_nesting_level", "indentation_level"]

export function isAnyMetricAvailable<T extends Pick<NodeMetricData, "maxValue">[]>(metricData: T) {
	return metricData.some(x => x.maxValue > 0)
}

export function areScenarioSettingsApplicable(scenario: RecursivePartial<Settings>, nodeMetricData: Pick<NodeMetricData, "name">[]) {
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

export function preselectCombination(nodeMetricData: Pick<NodeMetricData, "name">[]) {
	const preselectCombinationMetrics: string[] = []
	// combinations might be a parameter for this function for different scenarios
	const combination = { AreaMetric: sizeMetrics, HeightMetric: complexityMetrics, ColorMetric: complexityMetrics }
	const nodeMetricSet = new Set(nodeMetricData.map(data => data.name))
	for (const key in combination) {
		for (const metric of combination[key]) {
			if (nodeMetricSet.has(metric)) {
				preselectCombinationMetrics.push(metric)
				break
			}
		}
	}
	return preselectCombinationMetrics
}
