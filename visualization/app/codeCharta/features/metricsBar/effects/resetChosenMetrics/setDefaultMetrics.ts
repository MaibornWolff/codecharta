import { Store } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../../codeCharta.model"
import { setAreaMetric, setColorMetric, setDistributionMetric, setHeightMetric } from "../../../../mapState/mapState.write.facade"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { defaultNMetrics, preselectCombination } from "./utils/metricHelper"

/**
 * Compute + dispatch the default area/height/color/distribution metric selection for the given node
 * metric data. Shared by the metricsBar ResetChosenMetricsEffect and the globalSettings map-reset store
 * (reached cross-feature via the metricsBar facade), so it lives in its own module rather than inside
 * the effect class file (Slice 15c).
 */
export function setDefaultMetrics(store: Store<CcState>, nodeMetricData: NodeMetricData[]) {
    store.dispatch(setDistributionMetric({ value: getDefaultDistribution(nodeMetricData) }))

    let [defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = preselectCombination(nodeMetricData)
    if (!defaultedAreaMetric || !defaultedHeightMetric || !defaultedColorMetric) {
        ;[defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = defaultNMetrics(nodeMetricData, 3)
    }

    store.dispatch(setAreaMetric({ value: defaultedAreaMetric }))
    store.dispatch(setHeightMetric({ value: defaultedHeightMetric }))
    store.dispatch(setColorMetric({ value: defaultedColorMetric }))
}
