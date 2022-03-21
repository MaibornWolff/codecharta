import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { getAttributeTypeSelector } from "../../../state/selectors/getAttributeTypeOfNodesByMetric.selector"
import { primaryMetricNamesSelector } from "../../attributeSideBar/attributeSideBarPrimaryMetrics/primaryMetricNames.selector"

export const createAttributeTypeSelector = (metricType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) =>
	createSelector([primaryMetricNamesSelector, getAttributeTypeSelector], (primaryMetricNames, getAttributeType) =>
		getAttributeType(metricType, primaryMetricNames[metricFor]) === "relative" ? "x͂" : "Σ"
	)
