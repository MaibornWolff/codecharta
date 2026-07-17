import { createSelector } from "@ngrx/store"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { colorMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { blacklistMatcherSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"

export const nodeMetricDataSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateNodeMetricData)

export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
