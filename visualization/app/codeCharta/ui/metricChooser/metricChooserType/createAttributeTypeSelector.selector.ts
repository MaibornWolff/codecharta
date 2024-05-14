import { createSelector } from "@ngrx/store"
import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
	createSelector(primaryMetricNamesSelector, attributeTypesSelector, (primaryMetricNames, attributeTypes) => {
		const metricName = primaryMetricNames[metricFor]
		return attributeTypes[metricType][metricName] === "relative" ? "x͂" : "Σ"
	})
