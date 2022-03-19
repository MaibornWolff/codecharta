import { PrimaryMetrics } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/createSelector"
import { getAttributeTypeOfNodesByMetricSelector } from "../../../state/selectors/getAttributeTypeOfNodesByMetric.selector"
import { primaryMetricNamesSelector } from "../../attributeSideBar/attributeSideBarPrimaryMetrics/primaryMetricNames.selector"

export const createAttributeTypeSelector = (metricFor: keyof PrimaryMetrics) =>
	createSelector(
		[primaryMetricNamesSelector, getAttributeTypeOfNodesByMetricSelector],
		(primaryMetricNames, getAttributeTypeOfNodesByMetric) =>
			getAttributeTypeOfNodesByMetric(primaryMetricNames[metricFor]) === "relative" ? "x͂" : "Σ"
	)
