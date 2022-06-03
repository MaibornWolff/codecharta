import { Inject, Injectable } from "@angular/core"
import { filter, tap } from "rxjs"
import { defaultNMetrics, isAnyMetricAvailable, areScenarioSettingsApplicable } from "./utils/metricHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { nodeMetricDataSelector } from "../../selectors/accumulatedData/metricData/nodeMetricData.selector"
import { setState } from "../../store/state.actions"
import { ScenarioHelper } from "../../../util/scenarioHelper"
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

					const defaultScenarioSettings = ScenarioHelper.getDefaultScenarioSetting()
					if (areScenarioSettingsApplicable(defaultScenarioSettings, nodeMetricData)) {
						this.store.dispatch(setState(defaultScenarioSettings))
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
