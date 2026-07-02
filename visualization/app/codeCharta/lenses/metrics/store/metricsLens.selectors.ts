import { createSelector } from "@ngrx/store"
import { calculateNodeMetricData } from "../../../util/metric/nodeMetricData.calculator"
import { rangeOfMetric } from "../../../util/metric/metricRange"
import { blacklistMatcherSelector } from "../../../state/store/fileSettings/blacklist/blacklistMatcher.selector"
import { colorMetricSelector } from "../../../mapState/mapState.facade"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"

/**
 * Node metrics for the visible selection. Inputs are EXACTLY `visibleFileStates` + `blacklistMatcher`
 * (the two `calculateNodeMetricData` consumes) so the selector's memoization matches today's
 * `metricDataSelector`. Edge metrics stay on the legacy `metricDataSelector` (dependency lens, later).
 */
export const nodeMetricDataSelector = createSelector(visibleFileStatesSelector, blacklistMatcherSelector, calculateNodeMetricData)

/** Node-only re-implementation of `selectedColorMetricDataSelector`: the range of the color metric. */
export const metricRangeSelector = createSelector(nodeMetricDataSelector, colorMetricSelector, rangeOfMetric)
