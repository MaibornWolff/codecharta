import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"

export type LegendMetric = {
	metricName: string
	description: string
}

export function getShortDescription(metric: string, attributeDescriptors: AttributeDescriptors) {
	if (attributeDescriptors[metric]?.title !== undefined && attributeDescriptors[metric].title !== "") {
		return attributeDescriptors[metric].title
	}

	//Fallback Description can still return null
	return metricDescriptions.get(metric)
}
