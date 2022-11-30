import { createSelector } from "../../../state/angular-redux/createSelector"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributesDescriptors.selector"
import { CcState } from "../../../state/store/store"
import { LegendMetric } from "./legendMetric"
import { AttributeDescriptors } from "../../../codeCharta.model"

export const legendAreaMetricSelector: (state: CcState) => LegendMetric = createSelector(
	[areaMetricSelector, attributeDescriptorsSelector],
	(areaMetric, attributeDescriptors) => ({
		metricName: areaMetric,
		description: getDescription(areaMetric, attributeDescriptors)
	})
)

function getDescription(metric: string, attributeDescriptors: AttributeDescriptors) {
	// eslint-disable-next-line no-console
	console.log(attributeDescriptors)
	// eslint-disable-next-line no-console
	console.log(attributeDescriptors.test["testDefaultKeyAttrDescrAction36"])
	if (attributeDescriptors.test["testDefaultKeyAttrDescrAction36"] !== undefined) {
		return attributeDescriptors.test["testDefaultKeyAttrDescrAction36"]
	}
	//Fallback Description
	return metricDescriptions.get(metric)
}
