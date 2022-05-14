import { Inject, Injectable } from "@angular/core"
import { combineLatest, filter, map } from "rxjs"
import { isActionOfType } from "../../../../util/reduxHelper"
import { createEffect } from "../../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../../angular-redux/effects/effects.module"
import { Store } from "../../../angular-redux/store"
import { NodeMetricRange, nodeMetricRangeSelector } from "../../../selectors/accumulatedData/metricData/nodeMetricRange.selector"
import { FilesSelectionActions } from "../../files/files.actions"
import { ColorMetricActions } from "../colorMetric/colorMetric.actions"
import { setColorRange } from "./colorRange.actions"

@Injectable()
export class ResetColorRangeEffect {
	private nodeMetricRange$ = this.store.select(nodeMetricRangeSelector)
	private resetActions$ = this.actions$.pipe(
		filter(action => isActionOfType(action.type, FilesSelectionActions) || isActionOfType(action.type, ColorMetricActions))
	)

	constructor(@Inject(ActionsToken) private actions$: Actions, @Inject(Store) private store: Store) {}

	resetColorRange$ = createEffect(() =>
		combineLatest([this.resetActions$, this.nodeMetricRange$]).pipe(
			map(([, nodeMetricRange]) => setColorRange(_nodeMetricRangeToInitialColorRange(nodeMetricRange)))
		)
	)
}

export const _nodeMetricRangeToInitialColorRange = (nodeMetricRange: NodeMetricRange) => {
	const totalRange = nodeMetricRange.maxValue - nodeMetricRange.minValue
	const aThird = Math.round(totalRange / 3)
	const firstThird = aThird + nodeMetricRange.minValue
	const secondThird = aThird * 2 + nodeMetricRange.minValue
	return { from: firstThird, to: secondThird }
}
