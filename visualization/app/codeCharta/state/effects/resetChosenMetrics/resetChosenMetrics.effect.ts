import { Inject, Injectable } from "@angular/core"
import { filter, tap } from "rxjs"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "./utils/metricHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { nodeMetricDataSelector } from "../../selectors/accumulatedData/metricData/nodeMetricData.selector"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"

@Injectable()
export class ResetChosenMetricsEffect {
	constructor(@Inject(Store) private store: Store) {}

	resetChosenDistributionMetric$ = createEffect(
		() =>
			this.store.select(nodeMetricDataSelector).pipe(
				filter(isAnyMetricAvailable),
				tap(nodeMetricData => {
					this.store.dispatch(setDistributionMetric(getDefaultDistribution(nodeMetricData)))
					const matchingMetricSettings = preselectCombination(nodeMetricData)
					if (matchingMetricSettings.length === 3) {
						this.store.dispatch(setAreaMetric(matchingMetricSettings[0]))
						this.store.dispatch(setHeightMetric(matchingMetricSettings[1]))
						this.store.dispatch(setColorMetric(matchingMetricSettings[2]))
					} else {
						const [defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = defaultNMetrics(nodeMetricData, 3)
						this.store.dispatch(setAreaMetric(defaultedAreaMetric))
						this.store.dispatch(setHeightMetric(defaultedHeightMetric))
						this.store.dispatch(setColorMetric(defaultedColorMetric))
					}
				})
			),
		{ dispatch: false }
	)
}
