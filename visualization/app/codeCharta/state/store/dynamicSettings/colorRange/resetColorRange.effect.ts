import { Injectable } from "@angular/core"
import { Actions, createEffect, ofType } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { map, switchMap, take, withLatestFrom } from "rxjs/operators"
import { calculateInitialColorRange } from "./calculateInitialColorRange"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { setColorRange } from "./colorRange.actions"
import { setFiles } from "../../files/files.actions"
import { CcState } from "../../../../codeCharta.model"
import { colorRangeSelector } from "./colorRange.selector"

@Injectable()
export class ResetColorRangeEffect {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<CcState>
    ) {}

    // Only reset colors when loading new files, not when changing metrics
    resetColorRange$ = createEffect(() =>
        this.actions$.pipe(
            ofType(setFiles),
            withLatestFrom(this.store.select(colorRangeSelector)),
            switchMap(([_, currentColorRange]) =>
                this.store.select(selectedColorMetricDataSelector).pipe(
                    take(1),
                    map(selectedColorMetricData => {
                        // Only set initial colors if we don't have any custom colors yet
                        if (currentColorRange.from === 0 && currentColorRange.to === 0) {
                            return setColorRange({ value: calculateInitialColorRange(selectedColorMetricData) })
                        }
                        return setColorRange({ value: currentColorRange })
                    })
                )
            )
        )
    )
}
