import { createSelector } from "@ngrx/store"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { colorMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { blacklistMatcherSelector, metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"

export const nodeMetricDataSelector = createSelector(
    structureTreeSelector,
    blacklistMatcherSelector,
    metricRulesSelector,
    (structureTree, matcher, metricRules) => calculateNodeMetricData(structureTree?.map, matcher, metricRules)
)

export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
