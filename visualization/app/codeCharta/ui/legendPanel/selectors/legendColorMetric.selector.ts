import { createSelector } from "../../../state/angular-redux/createSelector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { CcState } from "../../../state/store/store"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { LegendMetric } from "./legendMetric"

export const legendColorMetricSelector: (state: CcState) => LegendMetric = createSelector([colorMetricSelector], colorMetric => ({
	metricName: colorMetric,
	description: metricDescriptions.get(colorMetric)
}))
