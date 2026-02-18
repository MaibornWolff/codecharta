import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
import { amountOfEdgePreviewsSelector } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { filter, map, skip, withLatestFrom } from "rxjs"
import { setAmountOfEdgePreviews } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { createEffect } from "@ngrx/effects"

@Injectable()
export class UpdateAmountOfEdgePreviewsEffect {
    constructor(private readonly store: Store<CcState>) {}

    updateAmountOfEdgePreviews$ = createEffect(() =>
        this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector).pipe(
            withLatestFrom(this.store.select(amountOfEdgePreviewsSelector)),
            skip(1),
            filter(
                ([amountOfBuildingsWithSelectedEdgeMetric, amountOfEdgePreviews]) =>
                    amountOfEdgePreviews > amountOfBuildingsWithSelectedEdgeMetric
            ),
            map(([amountOfBuildingsWithSelectedEdgeMetric]) => {
                return setAmountOfEdgePreviews({ value: amountOfBuildingsWithSelectedEdgeMetric })
            })
        )
    )
}
