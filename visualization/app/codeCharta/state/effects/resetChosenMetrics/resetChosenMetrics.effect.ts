import { Inject, Injectable } from "@angular/core"
import { tap } from "rxjs"
import { isAnyMetricAvailable } from "./utils/metricHelper"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { nodeMetricDataSelector } from "../../selectors/accumulatedData/metricData/nodeMetricData.selector"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { getDefaultDistribution } from "./utils/getDefaultDistributionMetric"

@Injectable()
export class ResetChosenMetricsEffect {
	constructor(@Inject(Store) private store: Store) {}

	resetChosenDistributionMetric$ = createEffect(() =>
		this.store.select(nodeMetricDataSelector).pipe(
			tap(nodeMetricData => {
				if (isAnyMetricAvailable(nodeMetricData)) {
					// when migrating area, height and color service, their resetting will be added here as well
					this.store.dispatch(setDistributionMetric(getDefaultDistribution(nodeMetricData)))
				}
			})
		)
	)
}
