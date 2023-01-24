import { Inject, Injectable } from "@angular/core"
import { filter, map, withLatestFrom } from "rxjs"
import { isAction, isActionOfType } from "../../../../util/reduxHelper"
import { createEffect } from "../../../angular-redux/effects/createEffect"
import { Actions, ActionsToken } from "../../../angular-redux/effects/effects.module"
import { Store } from "../../../angular-redux/store"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { FilesSelectionActions } from "../../files/files.actions"
import { calculateInitialColorRange } from "./calculateInitialColorRange"
import { ColorRangeActions, setColorRange, SetColorRangeAction } from "./colorRange.actions"

@Injectable()
export class ResetColorRangeEffect {
	private resetActions$ = this.actions$.pipe(
		filter(
			action =>
				isActionOfType(action.type, FilesSelectionActions) ||
				(isAction<SetColorRangeAction>(action, ColorRangeActions.SET_COLOR_RANGE) &&
					action.payload.from === null &&
					action.payload.to === null)
		)
	)

	constructor(@Inject(ActionsToken) private actions$: Actions, private store: Store) {}

	resetColorRange$ = createEffect(() =>
		this.resetActions$.pipe(
			withLatestFrom(this.store.select(selectedColorMetricDataSelector)),
			map(([, selectedColorMetricData]) => setColorRange(calculateInitialColorRange(selectedColorMetricData)))
		)
	)
}
