import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { primaryMetricNamesSelector } from "../../attributeSideBar/attributeSideBarPrimaryMetrics/primaryMetricNames.selector"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
	createSelector([primaryMetricNamesSelector, attributeTypesSelector], (primaryMetricNames, attributeTypes) => {
		const metricName = primaryMetricNames[metricFor]
		return attributeTypes[metricType][metricName] === "relative" ? "x͂" : "Σ"
	})
