import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"

export type LegendMetric = {
	metricName: string
	description: string
}

export function getDescription(metric: string, attributeDescriptors: AttributeDescriptors) {
	if (attributeDescriptors["testKeyFileHelper52"] !== undefined) {
		return attributeDescriptors["testKeyFileHelper52"].description
	}

	//Fallback Description can still return null
	return metricDescriptions.get(metric)
}
