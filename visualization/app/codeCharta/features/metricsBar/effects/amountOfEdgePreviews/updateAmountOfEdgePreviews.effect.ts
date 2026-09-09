import { Injectable } from "@angular/core"
import { createEffect } from "@ngrx/effects"
import { Store } from "@ngrx/store"
import { combineLatest, filter, map, skip } from "rxjs"
import { CcState } from "../../../../model/codeCharta.model"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { amountOfEdgePreviewsSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setAmountOfEdgePreviews } from "../../../../stores/mapState/mapState.write.facade"

@Injectable()
export class UpdateAmountOfEdgePreviewsEffect {
    constructor(private readonly store: Store<CcState>) {}

    /**
     * Watches the preview amount as well as the building count, because a scenario can carry a preview
     * amount saved on a larger map — a value the slider itself could never reach.
     */
    updateAmountOfEdgePreviews$ = createEffect(() =>
        combineLatest([
            this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector),
            this.store.select(amountOfEdgePreviewsSelector)
        ]).pipe(
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
