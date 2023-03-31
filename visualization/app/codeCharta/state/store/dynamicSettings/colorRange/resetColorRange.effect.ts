import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map, skip, switchMap, take } from "rxjs"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { calculateInitialColorRange } from "./calculateInitialColorRange"
import { setColorRange } from "./colorRange.actions"
import { fileActions } from "../../files/files.actions"
import { State } from "../../../../codeCharta.model"

@Injectable()
export class ResetColorRangeEffect {
	constructor(private actions$: Actions, private store: Store<State>) {}

	resetColorRange$ = createEffect(() =>
		this.actions$.pipe(
			ofType(...fileActions),
			switchMap(() => this.store.select(selectedColorMetricDataSelector).pipe(skip(1), take(1))),
			map(selectedColorMetricData => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
		)
	)

	// todo { from: null, to: null } := reset
}
