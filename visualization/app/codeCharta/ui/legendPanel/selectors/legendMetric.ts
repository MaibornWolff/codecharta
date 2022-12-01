import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricTitles } from "../../../util/metric/metricTitles"

export type LegendMetric = {
	metricName: string
	title: string
	description: string
}

export function getLegendMetric(metric: string, attributeDescriptors: AttributeDescriptors): LegendMetric {
	return {
		metricName: metric,
		title: getMetricTitle(metric, attributeDescriptors),
		description: attributeDescriptors?.[metric]?.description
	}
}

function getMetricTitle(metric: string, attributeDescriptors: AttributeDescriptors) {
	if (attributeDescriptors?.[metric]?.title !== undefined && attributeDescriptors[metric].title !== "") {
		return attributeDescriptors[metric].title
	}
	//Fallback Description can still return null
	return metricTitles.get(metric)
}
