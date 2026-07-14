import { Store } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../../model/codeCharta.model"
import { setAreaMetric, setColorMetric, setDistributionMetric, setHeightMetric } from "../../../../stores/mapState/mapState.write.facade"
import { getDefaultDistribution } from "../../../../util/metric/getDefaultDistributionMetric"
import { defaultNMetrics, preselectCombination } from "../../../../util/metric/metricHelper"

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
