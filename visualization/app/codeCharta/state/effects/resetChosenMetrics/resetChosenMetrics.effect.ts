import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { filter, tap, withLatestFrom, map } from "rxjs"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "./utils/metricHelper"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { areChosenMetricsAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { CcState } from "../../../codeCharta.model"
import { Store } from "@ngrx/store"

@Injectable()
export class ResetChosenMetricsEffect {
	constructor(private store: Store<CcState>) {}

	resetChosenDistributionMetric$ = createEffect(
		() =>
			this.store.select(metricDataSelector).pipe(
				map(metricData => metricData.nodeMetricData),
				filter(isAnyMetricAvailable),
				withLatestFrom(this.store.select(areChosenMetricsAvailableSelector)),
				filter(([, areChosenMetricsAvailable]) => !areChosenMetricsAvailable),
				tap(([nodeMetricData]) => {
					this.store.dispatch(setDistributionMetric({ value: getDefaultDistribution(nodeMetricData) }))

					let [defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = preselectCombination(nodeMetricData)
					if (!defaultedAreaMetric || !defaultedHeightMetric || !defaultedColorMetric) {
						;[defaultedAreaMetric, defaultedHeightMetric, defaultedColorMetric] = defaultNMetrics(nodeMetricData, 3)
					}

					this.store.dispatch(setAreaMetric({ value: defaultedAreaMetric }))
					this.store.dispatch(setHeightMetric({ value: defaultedHeightMetric }))
					this.store.dispatch(setColorMetric({ value: defaultedColorMetric }))
				})
			),
		{ dispatch: false }
	)
}
