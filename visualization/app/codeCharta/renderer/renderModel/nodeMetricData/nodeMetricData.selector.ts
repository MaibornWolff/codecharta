import { createSelector } from "@ngrx/store"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { colorMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { excludeMatcherSelector, excludeMetricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"

export const nodeMetricDataSelector = createSelector(
    structureTreeSelector,
    excludeMatcherSelector,
    excludeMetricRulesSelector,
    (structureTree, matcher, excludeMetricRules) => calculateNodeMetricData(structureTree?.map, matcher, excludeMetricRules)
)

export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
