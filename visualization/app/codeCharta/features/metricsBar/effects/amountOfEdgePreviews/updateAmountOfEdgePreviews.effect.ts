import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { filter, map, skip, withLatestFrom } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { amountOfEdgePreviewsSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setAmountOfEdgePreviews } from "../../../../stores/mapState/mapState.write.facade"

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
