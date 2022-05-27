import { Inject, Injectable } from "@angular/core"
import { tap, withLatestFrom } from "rxjs"
import { createEffect } from "../../angular-redux/effects/createEffect"
import { Store } from "../../angular-redux/store"
import { toggleEdgeMetricVisible } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { isEdgeMetricVisibleSelector } from "../../store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"

@Injectable()
export class UpdateEdgePreviewsEffect {
	constructor(@Inject(Store) private store: Store) {}

	updateEdgePreviews$ = createEffect(
		() =>
			this.store.select(edgeMetricSelector).pipe(
				withLatestFrom(this.store.select(isEdgeMetricVisibleSelector)),
				tap(([edgeMetric, isEdgeMetricVisible]) => {
					if (!isEdgeMetricVisible) {
						this.store.dispatch(toggleEdgeMetricVisible())
					}
					// todo this.codeMapActionsService.updateEdgePreviews()
					console.log(edgeMetric)
				})
			),
		{ dispatch: false }
	)
}
