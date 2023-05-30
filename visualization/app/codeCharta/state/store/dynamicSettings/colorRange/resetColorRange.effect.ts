import { Injectable } from "@angular/core"
import { Store, State } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map, skip, switchMap, take, tap } from "rxjs"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { calculateInitialColorRange } from "./calculateInitialColorRange"
import { setColorRange } from "./colorRange.actions"
import { fileActions } from "../../files/files.actions"
import { CcState } from "../../../../codeCharta.model"

@Injectable()
export class ResetColorRangeEffect {
	constructor(private actions$: Actions, private store: Store<CcState>, private state: State<CcState>) {}

	resetColorRange$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...fileActions),
			switchMap(() => this.store.select(selectedColorMetricDataSelector).pipe(skip(1), take(1))),
			map(selectedColorMetricData => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
		)
	)

	resetColorRangeOnColorMetricChange$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType("SET_COLOR_METRIC"),
				tap(() => {
					const selectedColorMetricData = selectedColorMetricDataSelector(this.state.getValue())
					this.store.dispatch(setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
				})
			),
		{ dispatch: false }
	)
}
