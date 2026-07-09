import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, skip, switchMap, take, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { fileActions, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { setColorMetric, setColorRange } from "../../../../stores/mapState/mapState.write.facade"
import { calculateInitialColorRange } from "../../../../util/color/calculateInitialColorRange"

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
