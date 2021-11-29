import { createSelector } from "../../../state/angular-redux/createSelector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { heightMetricSelector } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { CcState } from "../../../state/store/store"

export type PrimaryMetricNames = {
	nameOfAreaMetric: string
	nameOfHeightMetric: string
	nameOfColorMetric: string
	nameOfEdgeMetric: string
}

export const primaryMetricNamesSelector: (state: CcState) => PrimaryMetricNames = createSelector(
	[areaMetricSelector, heightMetricSelector, colorMetricSelector, edgeMetricSelector],
	(nameOfAreaMetric, nameOfHeightMetric, nameOfColorMetric, nameOfEdgeMetric) => ({
		nameOfAreaMetric,
		nameOfHeightMetric,
		nameOfColorMetric,
		nameOfEdgeMetric
	})
)
