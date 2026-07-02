import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { map, skip, switchMap, take, withLatestFrom } from "rxjs"
import { selectedColorMetricDataSelector } from "../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { calculateInitialColorRange } from "../../../mapState/store/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../mapState/store/colorRange/colorRange.actions"
import { fileActions } from "../../../fileStore/store/files.actions"
import { CcState } from "../../../codeCharta.model"
import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"

@Injectable()
export class ResetColorRangeEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    resetColorRange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(...fileActions),
            withLatestFrom(this.store.select(visibleFileStatesSelector)),
            switchMap(() => this.store.select(selectedColorMetricDataSelector).pipe(skip(1), take(1))),
            map(selectedColorMetricData => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
        )
    )

    resetColorRangeOnColorMetricChange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(setColorMetric),
            switchMap(() => this.store.select(selectedColorMetricDataSelector).pipe(take(1))),
            map(selectedColorMetricData => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
        )
    )
}
