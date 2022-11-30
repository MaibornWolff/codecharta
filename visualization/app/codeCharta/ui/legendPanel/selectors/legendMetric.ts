import { AttributeDescriptors } from "../../../codeCharta.model"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"

export type LegendMetric = {
	metricName: string
	description: string
}

export function getDescription(metric: string, attributeDescriptors: AttributeDescriptors) {
	// eslint-disable-next-line no-console
	console.log(metric)
	// eslint-disable-next-line no-console
	console.log(attributeDescriptors)
	// eslint-disable-next-line no-console
	console.log(attributeDescriptors["testDefaultKeyAttrDescrAction36"])

	if (attributeDescriptors["testDefaultKeyAttrDescrAction36"] !== undefined) {
		return attributeDescriptors["testDefaultKeyAttrDescrAction36"]
	}

	//Fallback Description can still return null
	return metricDescriptions.get(metric)
}
