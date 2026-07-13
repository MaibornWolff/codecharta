import { Store } from "@ngrx/store"
import { CcState, NodeMetricData } from "../../../../model/codeCharta.model"
import { setAreaMetric, setColorMetric, setDistributionMetric, setHeightMetric } from "../../../../stores/mapState/mapState.write.facade"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { defaultNMetrics, preselectCombination } from "./utils/metricHelper"

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
