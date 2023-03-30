import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map, withLatestFrom } from "rxjs"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { calculateInitialColorRange } from "./calculateInitialColorRange"
import { setColorRange } from "./colorRange.actions"
import { fileActions } from "../../files/files.actions"
import { State } from "../../../../codeCharta.model"

@Injectable()
export class ResetColorRangeEffect {
	private resetActions$ = this.actions$.pipe(
		ofType(...fileActions)
		// TODO or case
		// filter action =>
		// 	isActionOfType(action.type, FilesSelectionActions) ||
		// 	(isAction<SetColorRangeAction>(action, ColorRangeActions.SET_COLOR_RANGE) &&
		// 		action.payload.from === null &&
		// 		action.payload.to === null)
	)

	constructor(private actions$: Actions, private store: Store<State>) {}

	resetColorRange$ = createEffect(() =>
		this.resetActions$.pipe(
			withLatestFrom(this.store.select(selectedColorMetricDataSelector)),
			map(([, selectedColorMetricData]) => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
		)
	)
}
