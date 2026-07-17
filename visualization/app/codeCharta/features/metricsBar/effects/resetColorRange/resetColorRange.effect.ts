import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, switchMap, take } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { setColorMetric, setColorRange } from "../../../../stores/mapState/mapState.write.facade"
import { calculateInitialColorRange } from "../../../../util/color/calculateInitialColorRange"

/**
 * The USER changed the color metric — derive a fresh color range for it.
 *
 * The file-driven half of this effect is gone: deriving the color range after a load is step 4 of the
 * post-load reconciliation sequence (load/effects/reconcileAfterLoad), which computes it from the
 * metric data it has just derived. That is what let the old `skip(1), take(1)` go — it existed only to
 * wait out a selector recomputation that the sequence now performs before it reads.
 */
@Injectable()
export class ResetColorRangeEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    resetColorRangeOnColorMetricChange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(setColorMetric),
            switchMap(() => this.store.select(selectedColorMetricDataSelector).pipe(take(1))),
            map(selectedColorMetricData => setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) }))
        )
    )
}
