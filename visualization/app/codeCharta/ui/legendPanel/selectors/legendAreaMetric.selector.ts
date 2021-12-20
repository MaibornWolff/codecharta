import { createSelector } from "../../../state/angular-redux/createSelector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { CcState } from "../../../state/store/store"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { LegendMetric } from "./legendMetric"

export const legendAreaMetricSelector: (state: CcState) => LegendMetric = createSelector([areaMetricSelector], areaMetric => ({
	metricName: areaMetric,
	description: metricDescriptions.get(areaMetric)
}))
