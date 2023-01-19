import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricTitles } from "../../../util/metric/metricTitles"

export type MetricDecorations = {
	key: string
	title: string
	description: string
	hintLowValue: string
	hintHighValue: string
	link: string
}

export function getMetricDecorations(metricKey: string, attributeDescriptors: AttributeDescriptors): MetricDecorations {
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
	//Fallback Description can still return null
	return metricTitles.get(metric)
}
