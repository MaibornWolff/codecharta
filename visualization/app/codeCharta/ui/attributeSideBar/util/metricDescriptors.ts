import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricTitles } from "../../../util/metric/metricTitles"

export type MetricDescriptors = {
	key: string
	title: string
	description: string
	hintLowValue: string
	hintHighValue: string
	link: string
}

export function getMetricDescriptors(metricKey: string, attributeDescriptors?: AttributeDescriptors): MetricDescriptors {
	return {
		key: metricKey,
		title: getMetricTitle(metricKey, attributeDescriptors),
		description: attributeDescriptors?.[metricKey]?.description,
		hintLowValue: attributeDescriptors?.[metricKey]?.hintLowValue,
		hintHighValue: attributeDescriptors?.[metricKey]?.hintHighValue,
		link: attributeDescriptors?.[metricKey]?.link
	}
}

function getMetricTitle(metric: string, attributeDescriptors: AttributeDescriptors) {
	if (attributeDescriptors?.[metric]?.title !== undefined && attributeDescriptors[metric].title !== "") {
		return attributeDescriptors[metric].title
	}
	//Fallback Description can still return undefined
	return metricTitles.get(metric)
}
