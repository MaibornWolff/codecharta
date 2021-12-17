import { createSelector } from "../../../state/angular-redux/createSelector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { CcState } from "../../../state/store/store"
import { metricDescriptions } from "../../../util/metric/metricDescriptions"
import { LegendMetric } from "./legendMetric"

export const legendHeightMetricSelector: (state: CcState) => LegendMetric = createSelector([heightMetricSelector], heightMetric => ({
	metricName: heightMetric,
	description: metricDescriptions.get(heightMetric)
}))
